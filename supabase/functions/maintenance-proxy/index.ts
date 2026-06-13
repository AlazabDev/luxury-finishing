import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonHeaders, corsHeaders } from "../_shared/cors.ts";
import {
  createMaintenanceRequest,
  queryMaintenanceRequests,
} from "../_shared/maintenance.ts";

// Simple in-memory rate limiter (per edge instance) — best-effort defence
// against abuse from a single IP. Production should add a durable layer.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 20;
const ipHits = new Map<string, { count: number; reset: number }>();

const phoneRe = /^01\d{9}$/;
const requestNumberRe = /^MR-\d{2}-\d{5}$/;
const allowedServiceTypes = new Set([
  "plumbing",
  "electrical",
  "ac",
  "painting",
  "carpentry",
  "general",
]);
const allowedPriorities = new Set(["low", "medium", "high"]);

const clientIp = (req: Request): string => {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
};

const rateLimit = (ip: string): boolean => {
  const now = Date.now();
  const bucket = ipHits.get(ip);
  if (!bucket || bucket.reset < now) {
    ipHits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX_REQUESTS) return false;
  return true;
};

const audit = (event: string, ip: string, details: Record<string, unknown>) => {
  // Structured log → visible in Supabase edge function logs.
  console.log(JSON.stringify({ fn: "maintenance-proxy", event, ip, ...details, ts: new Date().toISOString() }));
};

const errorResponse = (status: number, error: string) =>
  new Response(JSON.stringify({ success: false, error }), { status, headers: jsonHeaders });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    audit("rate_limited", ip, { method: req.method });
    return errorResponse(429, "Too many requests. Please slow down.");
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const request_number = url.searchParams.get("request_number")?.trim() || undefined;
      const client_phone = url.searchParams.get("client_phone")?.trim() || undefined;

      if (!request_number && !client_phone) {
        return errorResponse(400, "Provide request_number or client_phone");
      }
      if (request_number && !requestNumberRe.test(request_number)) {
        return errorResponse(400, "Invalid request_number format");
      }
      if (client_phone && !phoneRe.test(client_phone)) {
        return errorResponse(400, "Invalid client_phone format");
      }

      const result = await queryMaintenanceRequests({ request_number, client_phone });
      audit("query", ip, { ok: result.ok, request_number: !!request_number, client_phone: !!client_phone });

      if (!result.ok) {
        return new Response(JSON.stringify(result), { status: 400, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ success: true, data: result.data }), { headers: jsonHeaders });
    }

    if (req.method !== "POST") {
      return errorResponse(405, "Method not allowed");
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Invalid JSON body");
    }

    const action = typeof body.action === "string" ? body.action : "";

    if (action === "create") {
      const client_name = String(body.client_name ?? "").trim();
      const client_phone = String(body.client_phone ?? "").trim();
      const service_type = String(body.service_type ?? "").trim();
      const description = String(body.description ?? "").trim();
      const priority = String(body.priority ?? "medium").trim();
      const channel = typeof body.channel === "string" ? body.channel.trim() : undefined;

      if (client_name.length < 2 || client_name.length > 100) {
        return errorResponse(400, "Invalid client_name");
      }
      if (!phoneRe.test(client_phone)) {
        return errorResponse(400, "Invalid client_phone");
      }
      if (!allowedServiceTypes.has(service_type)) {
        return errorResponse(400, "Invalid service_type");
      }
      if (description.length < 5 || description.length > 1000) {
        return errorResponse(400, "Description must be 5–1000 characters");
      }
      if (!allowedPriorities.has(priority)) {
        return errorResponse(400, "Invalid priority");
      }

      const result = await createMaintenanceRequest({
        client_name,
        client_phone,
        service_type,
        description,
        priority,
        channel,
      });
      audit("create", ip, { ok: result.ok, service_type, priority });

      if (!result.ok) {
        return new Response(JSON.stringify(result), { status: 400, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ success: true, data: result.data }), { headers: jsonHeaders });
    }

    if (action === "query") {
      const request_number = typeof body.request_number === "string" ? body.request_number.trim() : undefined;
      const client_phone = typeof body.client_phone === "string" ? body.client_phone.trim() : undefined;

      if (!request_number && !client_phone) {
        return errorResponse(400, "Provide request_number or client_phone");
      }
      if (request_number && !requestNumberRe.test(request_number)) {
        return errorResponse(400, "Invalid request_number format");
      }
      if (client_phone && !phoneRe.test(client_phone)) {
        return errorResponse(400, "Invalid client_phone format");
      }

      const result = await queryMaintenanceRequests({ request_number, client_phone });
      audit("query", ip, { ok: result.ok, request_number: !!request_number, client_phone: !!client_phone });

      if (!result.ok) {
        return new Response(JSON.stringify(result), { status: 400, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ success: true, data: result.data }), { headers: jsonHeaders });
    }

    return errorResponse(400, "Invalid action. Use 'create' or 'query'");
  } catch (e) {
    audit("error", ip, { message: e instanceof Error ? e.message : "unknown" });
    return errorResponse(500, e instanceof Error ? e.message : "Unknown error");
  }
});
