import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsonHeaders as sharedJsonHeaders, corsHeaders } from "../_shared/cors.ts";
import {
  createMaintenanceRequest,
  queryMaintenanceRequests,
  type MaintenancePriority,
  type MaintenanceServiceType,
} from "../_shared/maintenance.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const phoneRe = /^01\d{9}$/;
const requestNumberRe = /^MR-\d{2}-\d{5}$/i;
const allowedServiceTypes = new Set<MaintenanceServiceType>([
  "plumbing",
  "electrical",
  "ac",
  "painting",
  "carpentry",
  "general",
]);
const allowedPriorities = new Set<MaintenancePriority>(["low", "medium", "high"]);
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 8 });

const jsonHeaders = {
  ...sharedJsonHeaders,
  "Cache-Control": "no-store",
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

const publicMaintenanceRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  const requestNumber = String(record.request_number ?? record.requestNo ?? record.id ?? "").trim();
  if (!requestNumber) return null;

  return {
    request_number: requestNumber,
    status: String(record.status ?? record.current_status ?? "pending").slice(0, 100),
    service_type: String(record.service_type ?? record.service ?? "").slice(0, 100) || undefined,
    priority: String(record.priority ?? "").slice(0, 50) || undefined,
    created_at: typeof record.created_at === "string" ? record.created_at : undefined,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : undefined,
  };
};

const sanitizeMaintenanceData = (value: unknown, depth = 0): unknown => {
  if (depth > 3) return null;

  if (Array.isArray(value)) {
    return value
      .slice(0, 5)
      .map((item) => publicMaintenanceRecord(item))
      .filter(Boolean);
  }

  const directRecord = publicMaintenanceRecord(value);
  if (directRecord) return directRecord;

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    if ("data" in objectValue) {
      return { data: sanitizeMaintenanceData(objectValue.data, depth + 1) };
    }
  }

  return null;
};

const queryFromValues = async (requestNumber?: string, clientPhone?: string) => {
  const normalizedRequestNumber = requestNumber?.trim().toUpperCase();
  const normalizedClientPhone = clientPhone?.trim();

  if (!normalizedRequestNumber && !normalizedClientPhone) {
    return { error: errorResponse(400, "Provide request_number or client_phone") };
  }
  if (normalizedRequestNumber && !requestNumberRe.test(normalizedRequestNumber)) {
    return { error: errorResponse(400, "Invalid request_number format") };
  }
  if (normalizedClientPhone && !phoneRe.test(normalizedClientPhone)) {
    return { error: errorResponse(400, "Invalid client_phone format") };
  }

  const result = await queryMaintenanceRequests({
    request_number: normalizedRequestNumber,
    client_phone: normalizedClientPhone,
  });

  if (!result.ok) {
    return { error: errorResponse(400, "Could not query maintenance requests") };
  }

  return { data: sanitizeMaintenanceData(result.data) };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many requests. Please slow down.", limit.retryAfterSeconds);
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const result = await queryFromValues(
        url.searchParams.get("request_number") ?? undefined,
        url.searchParams.get("client_phone") ?? undefined,
      );

      if (result.error) return result.error;
      return new Response(JSON.stringify({ success: true, data: result.data }), { headers: jsonHeaders });
    }

    if (req.method !== "POST") {
      return errorResponse(405, "Method not allowed");
    }

    if (exceedsContentLength(req, 12_000)) {
      return errorResponse(413, "Request body is too large");
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return errorResponse(400, "Invalid JSON body");

    const action = typeof body.action === "string" ? body.action : "";

    if (action === "create") {
      const clientName = String(body.client_name ?? "").trim();
      const clientPhone = String(body.client_phone ?? "").trim();
      const serviceType = String(body.service_type ?? "").trim() as MaintenanceServiceType;
      const description = String(body.description ?? "").trim();
      const priority = String(body.priority ?? "medium").trim() as MaintenancePriority;

      if (clientName.length < 2 || clientName.length > 100) {
        return errorResponse(400, "Invalid client_name");
      }
      if (!phoneRe.test(clientPhone)) {
        return errorResponse(400, "Invalid client_phone");
      }
      if (!allowedServiceTypes.has(serviceType)) {
        return errorResponse(400, "Invalid service_type");
      }
      if (description.length < 5 || description.length > 1_000) {
        return errorResponse(400, "Description must be 5–1000 characters");
      }
      if (!allowedPriorities.has(priority)) {
        return errorResponse(400, "Invalid priority");
      }

      const result = await createMaintenanceRequest({
        client_name: clientName,
        client_phone: clientPhone,
        service_type: serviceType,
        description,
        priority,
        channel: "website-chatbot",
      });

      if (!result.ok) {
        return errorResponse(400, "Could not create maintenance request");
      }

      return new Response(
        JSON.stringify({ success: true, data: sanitizeMaintenanceData(result.data) }),
        { headers: jsonHeaders },
      );
    }

    if (action === "query") {
      const result = await queryFromValues(
        typeof body.request_number === "string" ? body.request_number : undefined,
        typeof body.client_phone === "string" ? body.client_phone : undefined,
      );

      if (result.error) return result.error;
      return new Response(JSON.stringify({ success: true, data: result.data }), { headers: jsonHeaders });
    }

    return errorResponse(400, "Invalid action. Use 'create' or 'query'");
  } catch (error) {
    console.error("maintenance-proxy error:", error instanceof Error ? error.message : error);
    return errorResponse(500, "Internal server error");
  }
});
