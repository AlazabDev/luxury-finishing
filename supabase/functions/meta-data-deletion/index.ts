import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
import { getMetaConfig, verifySignedRequest } from "../_shared/meta.ts";

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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    if (!config.appSecret) {
      throw new Error("FB_APP_SECRET is not configured");
    }

    const contentType = req.headers.get("content-type") || "";
    let signedRequest = "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      signedRequest = String(formData.get("signed_request") || "");
    } else {
      const bodyText = await req.text();
      if (bodyText.trim().startsWith("{")) {
        const bodyJson = JSON.parse(bodyText) as Record<string, unknown>;
        signedRequest = String(bodyJson.signed_request || "");
      } else {
        const params = new URLSearchParams(bodyText);
        signedRequest = String(params.get("signed_request") || "");
      }
    }

    if (!signedRequest) {
      throw new Error("signed_request is required");
    }

    const payload = await verifySignedRequest(signedRequest, config.appSecret);
    const confirmationCode = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        url: `${config.siteUrl}/data-deletion?code=${confirmationCode}`,
        confirmation_code: confirmationCode,
        payload,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("meta-data-deletion error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
