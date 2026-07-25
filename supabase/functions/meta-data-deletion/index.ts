import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders as sharedJsonHeaders } from "../_shared/cors.ts";
import { getMetaConfig, verifySignedRequest } from "../_shared/meta.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });
const jsonHeaders = {
  ...sharedJsonHeaders,
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const errorResponse = (status: number, error: string, retryAfterSeconds?: number) =>
  new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: {
      ...jsonHeaders,
      ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const config = getMetaConfig();

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        status: "meta data deletion callback ready",
        data_deletion_url: `${config.siteUrl}/data-deletion`,
      }),
      { headers: jsonHeaders },
    );
  }

  if (req.method !== "POST") return errorResponse(405, "Method not allowed");
  if (exceedsContentLength(req, 16_000)) return errorResponse(413, "Request body is too large");

  const limit = rateLimit(req);
  if (!limit.allowed) return errorResponse(429, "Too many requests", limit.retryAfterSeconds);

  try {
    if (!config.appSecret) {
      console.error("meta-data-deletion configuration error: FB_APP_SECRET is missing");
      return errorResponse(503, "Service is not configured");
    }

    const contentType = req.headers.get("content-type") || "";
    let signedRequest = "";

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      signedRequest = String(formData.get("signed_request") || "");
    } else {
      const bodyText = await req.text();
      if (bodyText.trim().startsWith("{")) {
        const bodyJson = JSON.parse(bodyText) as Record<string, unknown>;
        signedRequest = String(bodyJson.signed_request || "");
      } else {
        signedRequest = String(new URLSearchParams(bodyText).get("signed_request") || "");
      }
    }

    if (!signedRequest || signedRequest.length > 12_000) {
      return errorResponse(400, "signed_request is required");
    }

    await verifySignedRequest(signedRequest, config.appSecret);
    const confirmationCode = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        url: `${config.siteUrl}/data-deletion?code=${confirmationCode}`,
        confirmation_code: confirmationCode,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("meta-data-deletion error:", error instanceof Error ? error.message : error);
    return errorResponse(400, "Invalid signed request");
  }
});
