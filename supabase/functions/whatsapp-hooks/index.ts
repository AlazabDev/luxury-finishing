import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
import {
  forwardMetaEvents,
  getMetaConfig,
  normalizeMetaWebhookPayload,
  verifyMetaWebhookSignature,
} from "../_shared/meta.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const config = getMetaConfig();
  const verifyToken =
    Deno.env.get("WHATSAPP_HOOKS_VERIFY_TOKEN")?.trim() || config.webhookVerifyToken;
  const appSecret =
    Deno.env.get("WHATSAPP_APP_SECRET")?.trim() || config.appSecret;

  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const providedVerifyToken = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge") || "";

    if (
      mode === "subscribe" &&
      verifyToken &&
      providedVerifyToken === verifyToken
    ) {
      return new Response(challenge, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
        },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Webhook verification failed" }), {
      status: 403,
      headers: jsonHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  try {
    const rawBody = await req.text();
    const verified = await verifyMetaWebhookSignature(
      rawBody,
      req.headers.get("x-hub-signature-256"),
      appSecret,
    );

    if (!verified) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid Meta signature" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const payload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
    const events = normalizeMetaWebhookPayload(payload);
    const forwarded = await forwardMetaEvents(events, payload, config).catch(() => false);

    return new Response(
      JSON.stringify({
        ok: true,
        handled: true,
        route: "/api/v2/whatsapp/hooks",
        events_count: events.length,
        forwarded,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("whatsapp-hooks error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
