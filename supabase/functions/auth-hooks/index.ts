import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
import { verifyRequestWithTokenOrSecret } from "../_shared/request-auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        status: "auth hooks ready",
        version: "v1",
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
    const rawBody = await req.text();
    const payload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
    const token = Deno.env.get("AUTH_HOOKS_TOKEN")?.trim();
    const secret = Deno.env.get("AUTH_HOOKS_SECRET")?.trim();
    const siteUrl = Deno.env.get("SITE_URL")?.trim();
    const requestOrigin = req.headers.get("origin")?.trim();
    const referer = req.headers.get("referer")?.trim();
    const isTrustedBrowserRequest = Boolean(
      siteUrl &&
      payload.source === "facebook-sdk" &&
      ((requestOrigin && requestOrigin === siteUrl) ||
        (referer && referer.startsWith(siteUrl))),
    );

    if ((token || secret) && !isTrustedBrowserRequest) {
      const isAuthorized = await verifyRequestWithTokenOrSecret({
        req,
        rawBody,
        token,
        secret,
      });

      if (!isAuthorized) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
          status: 401,
          headers: jsonHeaders,
        });
      }
    }

    const event =
      String(payload.event || payload.type || payload.action || "auth.event");
    const provider = String(payload.provider || payload.source || "external");

    return new Response(
      JSON.stringify({
        ok: true,
        handled: true,
        route: "/api/v1/auth/hooks",
        event,
        provider,
        received_at: new Date().toISOString(),
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("auth-hooks error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
