import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders as sharedJsonHeaders } from "../_shared/cors.ts";
import { createAiCompletion } from "../_shared/chat.ts";
import {
  createMaintenanceRequest,
  isValidRequestNumber,
  type MaintenancePriority,
  type MaintenanceServiceType,
  normalizePhoneNumber,
  queryMaintenanceRequests,
  summarizeCreatedRequest,
  summarizeQueryResult,
} from "../_shared/maintenance.ts";
import { verifyRequestWithTokenOrSecret } from "../_shared/request-auth.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });
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

const sanitizeMaintenanceData = (value: unknown): unknown => {
  const sanitizeRecord = (item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
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

  if (Array.isArray(value)) return value.slice(0, 5).map(sanitizeRecord).filter(Boolean);
  const direct = sanitizeRecord(value);
  if (direct) return direct;
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    return { data: sanitizeMaintenanceData((value as Record<string, unknown>).data) };
  }
  return null;
};

const detectAction = (payload: Record<string, unknown>, text: string) => {
  const explicitAction = String(payload.action ?? payload.intent ?? "").trim().toLowerCase();
  if (explicitAction === "create" || explicitAction === "create_maintenance") return "create";
  if (explicitAction === "query" || explicitAction === "query_maintenance") return "query";

  if (
    payload.request_number ||
    isValidRequestNumber(text.trim().toUpperCase()) ||
    /استعلام|متابعة|حالة|رقم الطلب/.test(text)
  ) {
    return "query";
  }

  if (
    payload.client_name ||
    payload.service_type ||
    payload.description ||
    /صيانة|عطل|بلاغ|طلب جديد|طلب صيانة|سباكة|كهرباء|تكييف|دهان|دهانات|نجارة/.test(text)
  ) {
    return "create";
  }

  return "general";
};

const buildCreateResponse = async (payload: Record<string, unknown>) => {
  const result = await createMaintenanceRequest({
    client_name: String(payload.client_name ?? "").slice(0, 100),
    client_phone: String(payload.client_phone ?? "").slice(0, 20),
    service_type: String(payload.service_type ?? "").slice(0, 50) as MaintenanceServiceType,
    description: String(payload.description ?? "").slice(0, 1_000),
    priority: String(payload.priority ?? "medium").slice(0, 20) as MaintenancePriority,
    channel: "external-chatbot",
  });

  if (!result.ok) {
    return {
      ok: true,
      handled: false,
      action: "create",
      response_text:
        "لإرسال طلب صيانة أحتاج اسم العميل، رقم الهاتف، نوع الخدمة، ووصف المشكلة بشكل واضح.",
      missing_fields: "missingFields" in result ? result.missingFields : undefined,
    };
  }

  return {
    ok: true,
    handled: true,
    action: "create",
    response_text: summarizeCreatedRequest(result.data),
    data: sanitizeMaintenanceData(result.data),
  };
};

const buildQueryResponse = async (payload: Record<string, unknown>, text: string) => {
  const requestNumber =
    String(payload.request_number ?? "").trim().slice(0, 30) ||
    (isValidRequestNumber(text.trim().toUpperCase()) ? text.trim().toUpperCase() : "");
  const clientPhone =
    String(payload.client_phone ?? "").trim().slice(0, 20) ||
    (/01\d{9}/.test(normalizePhoneNumber(text)) ? normalizePhoneNumber(text) : "");

  const result = await queryMaintenanceRequests({
    request_number: requestNumber || undefined,
    client_phone: clientPhone || undefined,
  });

  if (!result.ok) {
    return {
      ok: true,
      handled: false,
      action: "query",
      response_text:
        "لاستعلام طلب صيانة أرسل رقم الطلب بصيغة MR-25-00042 أو رقم هاتف العميل 01xxxxxxxxx.",
    };
  }

  return {
    ok: true,
    handled: true,
    action: "query",
    response_text: summarizeQueryResult(result.data),
    data: sanitizeMaintenanceData(result.data),
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, status: "chatbot endpoint ready" }),
      { headers: jsonHeaders },
    );
  }

  if (req.method !== "POST") return errorResponse(405, "Method not allowed");
  if (exceedsContentLength(req, 32_000)) return errorResponse(413, "Request body is too large");

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many requests", limit.retryAfterSeconds);
  }

  try {
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("CHATBOT_WEBHOOK_SECRET")?.trim();
    const chatbotToken = Deno.env.get("CHATBOT_TOKEN")?.trim();

    if (!webhookSecret && !chatbotToken) {
      console.error("chatbot-endpoint configuration error: no authentication secret configured");
      return errorResponse(503, "Service is not configured");
    }

    const verified = await verifyRequestWithTokenOrSecret({
      req,
      rawBody,
      token: chatbotToken,
      secret: webhookSecret,
    });

    if (!verified) return errorResponse(401, "Unauthorized webhook request");

    const payload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
    const text = String(
      payload.message ?? payload.text ?? payload.user_message ?? payload.prompt ?? "",
    ).trim().slice(0, 4_000);

    const action = detectAction(payload, text);

    if (action === "create") {
      return new Response(JSON.stringify(await buildCreateResponse(payload)), { headers: jsonHeaders });
    }

    if (action === "query") {
      return new Response(JSON.stringify(await buildQueryResponse(payload, text)), { headers: jsonHeaders });
    }

    const responseText = await createAiCompletion(
      text ? [{ role: "user", content: text }] : [{ role: "user", content: "مرحباً" }],
    );

    return new Response(
      JSON.stringify({
        ok: true,
        handled: true,
        action: "general",
        response_text: responseText,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("chatbot-endpoint error:", error instanceof Error ? error.message : error);
    return errorResponse(400, "Invalid request");
  }
});
