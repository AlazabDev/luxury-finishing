import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders as sharedJsonHeaders } from "../_shared/cors.ts";
import { verifyRequestWithTokenOrSecret } from "../_shared/request-auth.ts";
import { exceedsContentLength } from "../_shared/rate-limit.ts";

const jsonHeaders = {
  ...sharedJsonHeaders,
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const errorResponse = (status: number, error: string) =>
  new Response(JSON.stringify({ ok: false, error }), { status, headers: jsonHeaders });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, status: "auth hooks ready", version: "v1" }),
      { headers: jsonHeaders },
    );
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  if (exceedsContentLength(req, 32_000)) {
    return errorResponse(413, "Request body is too large");
  }

  try {
    const rawBody = await req.text();
    const token = Deno.env.get("AUTH_HOOKS_TOKEN")?.trim();
    const secret = Deno.env.get("AUTH_HOOKS_SECRET")?.trim();

    if (!token && !secret) {
      console.error("auth-hooks configuration error: no authentication secret configured");
      return errorResponse(503, "Service is not configured");
    }

    const isAuthorized = await verifyRequestWithTokenOrSecret({
      req,
      rawBody,
      token,
      secret,
    });

    if (!isAuthorized) {
      return errorResponse(401, "Unauthorized");
    }

    const payload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
    const event = String(payload.event || payload.type || payload.action || "auth.event").slice(0, 100);
    const provider = String(payload.provider || payload.source || "external").slice(0, 100);

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
    console.error("auth-hooks error:", error instanceof Error ? error.message : error);
    return errorResponse(400, "Invalid request");
  }
});
