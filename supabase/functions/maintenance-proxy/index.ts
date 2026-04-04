import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonHeaders, corsHeaders } from "../_shared/cors.ts";
import {
  createMaintenanceRequest,
  queryMaintenanceRequests,
} from "../_shared/maintenance.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
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

      return new Response(JSON.stringify({ success: true, data: result.data }), {
        headers: jsonHeaders,
      });
    }

    const { action, ...params } = await req.json();

    // Action: create - Create a new maintenance request
    if (action === "create") {
      const result = await createMaintenanceRequest({
        client_name: params.client_name,
        client_phone: params.client_phone,
        service_type: params.service_type,
        description: params.description,
        priority: params.priority,
        channel: params.channel,
      });

      if (!result.ok) {
        return new Response(
          JSON.stringify(result),
          { status: 400, headers: jsonHeaders }
        );
      }

      return new Response(JSON.stringify({ success: true, data: result.data }), {
        headers: jsonHeaders,
      });
    }

    // Action: query - Query maintenance request status
    if (action === "query") {
      const result = await queryMaintenanceRequests({
        request_number: params.request_number,
        client_phone: params.client_phone,
      });

      if (!result.ok) {
        return new Response(
          JSON.stringify(result),
          { status: 400, headers: jsonHeaders }
        );
      }

      return new Response(JSON.stringify({ success: true, data: result.data }), {
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'create' or 'query'" }), {
      status: 400,
      headers: jsonHeaders,
    });
  } catch (e) {
    console.error("Maintenance proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
