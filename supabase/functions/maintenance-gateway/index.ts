import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
import {
  createMaintenanceRequest,
  queryMaintenanceRequests,
} from "../_shared/maintenance.ts";
import { verifyRequestWithTokenOrSecret } from "../_shared/request-auth.ts";

const requiresGatewayAuth = () =>
  Boolean(
    Deno.env.get("MAINTENANCE_GATEWAY_TOKEN")?.trim() ||
    Deno.env.get("MAINTENANCE_GATEWAY_SECRET")?.trim(),
  );

const authorizeGatewayRequest = async (req: Request, rawBody: string) => {
  const token = Deno.env.get("MAINTENANCE_GATEWAY_TOKEN")?.trim();
  const secret = Deno.env.get("MAINTENANCE_GATEWAY_SECRET")?.trim();

  if (!token && !secret) return true;

  return verifyRequestWithTokenOrSecret({
    req,
    rawBody,
    token,
    secret,
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);

      if (!url.searchParams.get("request_number") && !url.searchParams.get("client_phone")) {
        return new Response(
          JSON.stringify({
            ok: true,
            status: "maintenance gateway ready",
            route: "/api/maintenance/gateway",
            supports: ["GET query", "POST create", "POST query"],
          }),
          { headers: jsonHeaders },
        );
      }

      const result = await queryMaintenanceRequests({
        request_number: url.searchParams.get("request_number") ?? undefined,
        client_phone: url.searchParams.get("client_phone") ?? undefined,
      });

      if (!result.ok) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          route: "/api/maintenance/gateway",
          data: result.data,
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

    const rawBody = await req.text();
    if (requiresGatewayAuth()) {
      const isAuthorized = await authorizeGatewayRequest(req, rawBody);
      if (!isAuthorized) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
          status: 401,
          headers: jsonHeaders,
        });
      }
    }

    const { action, ...params } = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};

    if (action === "create") {
      const result = await createMaintenanceRequest({
        client_name: String(params.client_name || ""),
        client_phone: String(params.client_phone || ""),
        service_type: String(params.service_type || ""),
        description: String(params.description || ""),
        priority: String(params.priority || "medium"),
        channel: String(params.channel || "maintenance-gateway"),
      });

      if (!result.ok) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          route: "/api/maintenance/gateway",
          data: result.data,
        }),
        { headers: jsonHeaders },
      );
    }

    if (action === "query") {
      const result = await queryMaintenanceRequests({
        request_number: params.request_number ? String(params.request_number) : undefined,
        client_phone: params.client_phone ? String(params.client_phone) : undefined,
      });

      if (!result.ok) {
        return new Response(JSON.stringify(result), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          route: "/api/maintenance/gateway",
          data: result.data,
        }),
        { headers: jsonHeaders },
      );
    }

    return new Response(JSON.stringify({ ok: false, error: "Invalid action" }), {
      status: 400,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("maintenance-gateway error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
