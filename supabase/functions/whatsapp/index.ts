import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";
import { requireNotificationAuth } from "../_shared/meta.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const GRAPH_API = "https://graph.facebook.com/v22.0";
const DEFAULT_SEAFILE_URL = "https://seafile.alazab.com";
const PHONE_NUMBER_ID_REGEX = /^\d{10,20}$/;
const RECIPIENT_PHONE_REGEX = /^\d{8,15}$/;
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MAX_MESSAGE_CHARS = 4_096;
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const jsonHeaders = {
  ...corsHeaders,
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const errorResponse = (status: number, error: string, retryAfterSeconds?: number) =>
  new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: {
      ...jsonHeaders,
      ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
    },
  });

const normalizePhone = (value: string) => value.replace(/[^\d]/g, "");
const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160) || "file";

const validateRecipient = (value: string) => {
  const normalized = normalizePhone(value);
  if (!RECIPIENT_PHONE_REGEX.test(normalized)) throw new Error("Invalid recipient phone number");
  return normalized;
};

const validatePhoneNumberId = (value: string) => {
  if (!PHONE_NUMBER_ID_REGEX.test(value)) {
    throw new Error("Invalid WhatsApp Phone Number ID configuration");
  }
};

const validateMedia = (file: File, mediaType: string) => {
  if (file.size === 0 || file.size > MAX_MEDIA_BYTES) {
    throw new Error("Media file must be between 1 byte and 10MB");
  }

  const allowedByType: Record<string, Set<string>> = {
    image: new Set(["image/jpeg", "image/png", "image/webp"]),
    audio: new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/aac", "audio/wav", "audio/webm"]),
    document: new Set([
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]),
  };

  if (!(mediaType in allowedByType) || !allowedByType[mediaType].has(file.type.toLowerCase())) {
    throw new Error("Unsupported WhatsApp media type");
  }
};

const trustedUploadUrl = (uploadLink: string, seafileUrl: string) => {
  const uploadUrl = new URL(uploadLink);
  const baseUrl = new URL(seafileUrl);
  const trusted =
    uploadUrl.protocol === "https:" &&
    (uploadUrl.hostname === baseUrl.hostname || uploadUrl.hostname.endsWith(`.${baseUrl.hostname}`));
  if (!trusted) throw new Error("Untrusted Seafile upload URL");
  return uploadUrl;
};

async function uploadToSeafile(fileBlob: Blob, fileName: string): Promise<string | null> {
  const token = Deno.env.get("SEAFILE_TOKEN")?.trim();
  const repoId = Deno.env.get("SEAFILE_REPO_ID")?.trim();
  const seafileUrl =
    Deno.env.get("SEAFILE_URL")?.trim().replace(/\/+$/, "") || DEFAULT_SEAFILE_URL;
  if (!token || !repoId) return null;

  const now = new Date();
  const folder = `/whatsapp-chat/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  try {
    await fetch(`${seafileUrl}/api2/repos/${repoId}/dir/?p=${encodeURIComponent(folder)}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "operation=mkdir",
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null);

    const uploadLinkResponse = await fetch(
      `${seafileUrl}/api2/repos/${repoId}/upload-link/?p=${encodeURIComponent(folder)}`,
      {
        headers: { Authorization: `Token ${token}` },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!uploadLinkResponse.ok) return null;

    const uploadUrl = trustedUploadUrl(
      (await uploadLinkResponse.text()).replace(/"/g, ""),
      seafileUrl,
    );
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);
    formData.append("parent_dir", folder);
    formData.append("replace", "0");

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { Authorization: `Token ${token}` },
      body: formData,
      signal: AbortSignal.timeout(60_000),
    });
    if (!uploadResponse.ok) return null;
    await uploadResponse.text();

    return `${seafileUrl}/lib/${repoId}/file${folder}/${fileName}`;
  } catch (error) {
    console.warn("Seafile archive unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function uploadToSupabaseStorage(fileBlob: Blob, fileName: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey =
    Deno.env.get("LF_SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceKey) return null;

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const filePath = `whatsapp/${new Date().toISOString().slice(0, 7)}/${fileName}`;
    const { error } = await supabase.storage.from("chat-files").upload(filePath, fileBlob, {
      contentType: fileBlob.type,
      upsert: false,
    });
    if (error) return null;
    const { data } = supabase.storage.from("chat-files").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.warn("Supabase archive unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

const postMetaJson = async (
  url: string,
  accessToken: string,
  body: Record<string, unknown>,
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    console.error("WhatsApp API error:", response.status, responseText.slice(0, 1_000));
    throw new Error("WhatsApp API request failed");
  }
  return responseText ? JSON.parse(responseText) : {};
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse(405, "Method not allowed");
  if (exceedsContentLength(req, MAX_MEDIA_BYTES + 512 * 1024)) {
    return errorResponse(413, "Request body is too large");
  }

  const limit = rateLimit(req);
  if (!limit.allowed) return errorResponse(429, "Too many requests", limit.retryAfterSeconds);

  const sharedToken = Deno.env.get("SYSTEM_NOTIFICATIONS_TOKEN")?.trim() || "";
  if (!sharedToken) {
    console.error("whatsapp configuration error: SYSTEM_NOTIFICATIONS_TOKEN is missing");
    return errorResponse(503, "Service is not configured");
  }
  if (!requireNotificationAuth(req, sharedToken)) return errorResponse(401, "Unauthorized");

  try {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN")?.trim();
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")?.trim() || "";
    if (!accessToken || !phoneNumberId) return errorResponse(503, "Service is not configured");
    validatePhoneNumberId(phoneNumberId);

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) return errorResponse(400, "No file provided");

      const to = validateRecipient(String(formData.get("to") || ""));
      const mediaType = String(formData.get("mediaType") || "document").toLowerCase();
      validateMedia(file, mediaType);

      const originalFileName = sanitizeFileName(String(formData.get("fileName") || file.name));
      const safeFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${originalFileName}`;
      const archiveUrl =
        (await uploadToSeafile(file, safeFileName)) ||
        (await uploadToSupabaseStorage(file, safeFileName));

      const uploadFormData = new FormData();
      uploadFormData.append("messaging_product", "whatsapp");
      uploadFormData.append("file", file, originalFileName);
      uploadFormData.append("type", file.type);

      const uploadResponse = await fetch(`${GRAPH_API}/${phoneNumberId}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: uploadFormData,
        signal: AbortSignal.timeout(60_000),
      });
      const uploadText = await uploadResponse.text();
      if (!uploadResponse.ok) {
        console.error("WhatsApp media upload error:", uploadResponse.status, uploadText.slice(0, 1_000));
        return errorResponse(502, "WhatsApp media upload failed");
      }

      const uploadData = JSON.parse(uploadText) as { id?: string };
      if (!uploadData.id) return errorResponse(502, "WhatsApp media upload returned no media id");

      const mediaPayload: Record<string, unknown> = {
        messaging_product: "whatsapp",
        to,
        type: mediaType,
        [mediaType]: mediaType === "document"
          ? { id: uploadData.id, filename: originalFileName }
          : { id: uploadData.id },
      };
      const data = await postMetaJson(
        `${GRAPH_API}/${phoneNumberId}/messages`,
        accessToken,
        mediaPayload,
      );

      return new Response(
        JSON.stringify({ success: true, data, archiveUrl }),
        { headers: jsonHeaders },
      );
    }

    if (!contentType.includes("application/json")) {
      return errorResponse(415, "Content-Type must be application/json or multipart/form-data");
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || body.action !== "send") return errorResponse(400, "Invalid action");

    const to = validateRecipient(String(body.to || ""));
    const message = String(body.message || "").trim();
    if (!message || message.length > MAX_MESSAGE_CHARS) {
      return errorResponse(400, `Message must be 1-${MAX_MESSAGE_CHARS} characters`);
    }

    const data = await postMetaJson(
      `${GRAPH_API}/${phoneNumberId}/messages`,
      accessToken,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message, preview_url: false },
      },
    );

    return new Response(JSON.stringify({ success: true, data }), { headers: jsonHeaders });
  } catch (error) {
    console.error("WhatsApp function error:", error instanceof Error ? error.message : error);
    return errorResponse(400, "Invalid WhatsApp request");
  }
});
