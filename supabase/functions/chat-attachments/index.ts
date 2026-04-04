import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";

const DEFAULT_SEAFILE_URL = "https://seafile.alazab.com";
const DEFAULT_PARENT_DIR = "/chatbot-attachments";

const sanitizePathSegment = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const sanitizeFileName = (value: string) => {
  const normalized = value.trim();
  const extensionIndex = normalized.lastIndexOf(".");
  const extension = extensionIndex > -1 ? normalized.slice(extensionIndex) : "";
  const baseName = extensionIndex > -1 ? normalized.slice(0, extensionIndex) : normalized;
  const safeBaseName = sanitizePathSegment(baseName) || "attachment";
  const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, "");
  return `${safeBaseName}${safeExtension}`;
};

const ensureDirectory = async (baseUrl: string, repoId: string, token: string, path: string) => {
  await fetch(`${baseUrl}/api2/repos/${repoId}/dir/?p=${encodeURIComponent(path)}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "operation=mkdir",
  }).catch(() => null);
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
  });

  if (!response.ok) {
    return `${baseUrl}/lib/${repoId}/file${filePath}`;
  }

  const payload = await response.json();
  return payload.link || `${baseUrl}/lib/${repoId}/file${filePath}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const seafileToken = Deno.env.get("SEAFILE_TOKEN")?.trim();
    const seafileRepoId = Deno.env.get("SEAFILE_REPO_ID")?.trim();
    const seafileUrl =
      Deno.env.get("SEAFILE_URL")?.trim().replace(/\/+$/, "") || DEFAULT_SEAFILE_URL;

    if (!seafileToken || !seafileRepoId) {
      throw new Error("Seafile credentials not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "file is required" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const category = sanitizePathSegment(String(formData.get("category") || "general")) || "general";
    const conversationId =
      sanitizePathSegment(String(formData.get("conversationId") || "session")) || "session";
    const year = new Date().getFullYear().toString();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const parentDir = `${DEFAULT_PARENT_DIR}/${category}/${year}/${month}/${conversationId}`;
    await ensureDirectoryTree(seafileUrl, seafileRepoId, seafileToken, parentDir);

    const uploadLinkResponse = await fetch(
      `${seafileUrl}/api2/repos/${seafileRepoId}/upload-link/?p=${encodeURIComponent(parentDir)}`,
      {
        headers: { Authorization: `Token ${seafileToken}` },
      },
    );

    if (!uploadLinkResponse.ok) {
      const errorText = await uploadLinkResponse.text();
      throw new Error(`Failed to get Seafile upload link: ${errorText}`);
    }

    const uploadLink = (await uploadLinkResponse.text()).replace(/"/g, "");
    const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file, safeFileName);
    uploadFormData.append("parent_dir", parentDir);
    uploadFormData.append("replace", "1");

    const uploadResponse = await fetch(uploadLink, {
      method: "POST",
      headers: { Authorization: `Token ${seafileToken}` },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload to Seafile: ${errorText}`);
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
          originalName: file.name,
          path: filePath,
          url: shareUrl,
          provider: "seafile",
          repoId: seafileRepoId,
          size: file.size,
          type: file.type || "application/octet-stream",
        },
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("chat-attachments error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
});
