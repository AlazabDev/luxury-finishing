import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders as sharedJsonHeaders } from "../_shared/cors.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const DEFAULT_SEAFILE_URL = "https://seafile.alazab.com";
const DEFAULT_PARENT_DIR = "/chatbot-attachments";
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

const jsonHeaders = {
  ...sharedJsonHeaders,
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const sanitizePathSegment = (value: string, maxLength = 80) =>
  value
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);

const sanitizeFileName = (value: string) => {
  const normalized = value.trim().slice(0, 180);
  const extensionIndex = normalized.lastIndexOf(".");
  const extension = extensionIndex > -1 ? normalized.slice(extensionIndex) : "";
  const baseName = extensionIndex > -1 ? normalized.slice(0, extensionIndex) : normalized;
  const safeBaseName = sanitizePathSegment(baseName, 120) || "attachment";
  const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 12);
  return `${safeBaseName}${safeExtension}`;
};

const startsWithBytes = (bytes: Uint8Array, signature: number[]) =>
  signature.every((value, index) => bytes[index] === value);

const validateFileSignature = async (file: File) => {
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
  const head = new Uint8Array(await file.slice(0, 4_096).arrayBuffer());

  if (extension === "pdf") {
    return startsWithBytes(head, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  if (extension === "jpg" || extension === "jpeg") {
    return startsWithBytes(head, [0xff, 0xd8, 0xff]);
  }
  if (extension === "png") {
    return startsWithBytes(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (extension === "webp") {
    return startsWithBytes(head, [0x52, 0x49, 0x46, 0x46]) &&
      String.fromCharCode(...head.slice(8, 12)) === "WEBP";
  }
  if (extension === "txt" || extension === "csv") {
    return !head.includes(0x00);
  }

  return false;
};

const ensureDirectory = async (baseUrl: string, repoId: string, token: string, path: string) => {
  const response = await fetch(`${baseUrl}/api2/repos/${repoId}/dir/?p=${encodeURIComponent(path)}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "operation=mkdir",
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);

  if (response && !response.ok && response.status !== 400) {
    throw new Error(`Failed to create Seafile directory [${response.status}]`);
  }
};

const ensureDirectoryTree = async (
  baseUrl: string,
  repoId: string,
  token: string,
  path: string,
) => {
  const segments = path.split("/").filter(Boolean);
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    await ensureDirectory(baseUrl, repoId, token, currentPath);
  }
};

const createShareLink = async (
  baseUrl: string,
  repoId: string,
  token: string,
  filePath: string,
) => {
  const response = await fetch(`${baseUrl}/api/v2.1/share-links/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_id: repoId,
      path: filePath,
      permissions: { can_download: true },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    return `${baseUrl}/lib/${repoId}/file${filePath}`;
  }

  const payload = await response.json();
  return typeof payload.link === "string"
    ? payload.link
    : `${baseUrl}/lib/${repoId}/file${filePath}`;
};

const errorResponse = (status: number, error: string, retryAfterSeconds?: number) =>
  new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: {
      ...jsonHeaders,
      ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  if (exceedsContentLength(req, MAX_ATTACHMENT_BYTES + 256 * 1024)) {
    return errorResponse(413, "file exceeds 10MB limit");
  }

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many attachment uploads", limit.retryAfterSeconds);
  }

  try {
    const seafileToken = Deno.env.get("SEAFILE_TOKEN")?.trim();
    const seafileRepoId = Deno.env.get("SEAFILE_REPO_ID")?.trim();
    const seafileUrl =
      Deno.env.get("SEAFILE_URL")?.trim().replace(/\/+$/, "") || DEFAULT_SEAFILE_URL;

    if (!seafileToken || !seafileRepoId) {
      console.error("chat-attachments configuration error: Seafile credentials are missing");
      return errorResponse(503, "Attachment service is temporarily unavailable");
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return errorResponse(400, "file is required");
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      return errorResponse(413, "file exceeds 10MB limit");
    }

    const allowedExtensions = /\.(jpe?g|png|webp|pdf|txt|csv)$/i;
    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
    ]);
    const declaredType = (file.type || "").toLowerCase();

    if (!allowedExtensions.test(file.name) || (declaredType && !allowedMimeTypes.has(declaredType))) {
      return errorResponse(400, "file type not allowed");
    }

    if (!(await validateFileSignature(file))) {
      return errorResponse(400, "file content does not match its extension");
    }

    const conversationId =
      sanitizePathSegment(String(formData.get("conversationId") || "session")) || "session";
    const now = new Date();
    const year = now.getUTCFullYear().toString();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const parentDir = `${DEFAULT_PARENT_DIR}/chatbot/${year}/${month}/${conversationId}`;
    await ensureDirectoryTree(seafileUrl, seafileRepoId, seafileToken, parentDir);

    const uploadLinkResponse = await fetch(
      `${seafileUrl}/api2/repos/${seafileRepoId}/upload-link/?p=${encodeURIComponent(parentDir)}`,
      {
        headers: { Authorization: `Token ${seafileToken}` },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!uploadLinkResponse.ok) {
      throw new Error(`Failed to get Seafile upload link [${uploadLinkResponse.status}]`);
    }

    const uploadLink = (await uploadLinkResponse.text()).replace(/"/g, "");
    const uploadUrl = new URL(uploadLink);
    const seafileOrigin = new URL(seafileUrl);
    const trustedUploadHost =
      uploadUrl.protocol === "https:" &&
      (uploadUrl.hostname === seafileOrigin.hostname ||
        uploadUrl.hostname.endsWith(`.${seafileOrigin.hostname}`));

    if (!trustedUploadHost) {
      throw new Error("Seafile returned an untrusted upload URL");
    }

    const safeFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${sanitizeFileName(file.name)}`;
    const uploadFormData = new FormData();
    uploadFormData.append("file", file, safeFileName);
    uploadFormData.append("parent_dir", parentDir);
    uploadFormData.append("replace", "0");

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { Authorization: `Token ${seafileToken}` },
      body: uploadFormData,
      signal: AbortSignal.timeout(60_000),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Seafile [${uploadResponse.status}]`);
    }

    await uploadResponse.text();

    const filePath = `${parentDir}/${safeFileName}`;
    const shareUrl = await createShareLink(
      seafileUrl,
      seafileRepoId,
      seafileToken,
      filePath,
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: safeFileName,
          path: filePath,
          url: shareUrl,
          provider: "seafile",
          size: file.size,
          type: declaredType || "application/octet-stream",
        },
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("chat-attachments error:", error instanceof Error ? error.message : error);
    return errorResponse(500, "Internal server error");
  }
});
