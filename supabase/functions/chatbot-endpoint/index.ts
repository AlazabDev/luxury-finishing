import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
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

const encoder = new TextEncoder();

const timingSafeEqual = (left: string, right: string) => {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) return false;

  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }

  return result === 0;
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const createHmacSignature = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
};

const verifyWebhookRequest = async (req: Request, rawBody: string) => {
  const webhookSecret = Deno.env.get("CHATBOT_WEBHOOK_SECRET")?.trim();
  const chatbotToken = Deno.env.get("CHATBOT_TOKEN")?.trim();

  const bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const directToken =
    req.headers.get("x-chatbot-token")?.trim() ||
    req.headers.get("x-api-key")?.trim();
  const secretHeader = req.headers.get("x-webhook-secret")?.trim();
  const signatureHeader = req.headers.get("x-signature")?.trim();

  if (chatbotToken && (bearerToken || directToken)) {
    const provided = bearerToken || directToken || "";
    if (timingSafeEqual(provided, chatbotToken)) return true;
  }

  if (webhookSecret && secretHeader && timingSafeEqual(secretHeader, webhookSecret)) {
    return true;
  }

  if (webhookSecret && signatureHeader) {
    const computed = await createHmacSignature(webhookSecret, rawBody);
    const normalizedSignature = signatureHeader.replace(/^sha256=/i, "");
    if (timingSafeEqual(normalizedSignature, computed)) {
      return true;
    }
  }

  return false;
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
    client_name: String(payload.client_name ?? ""),
    client_phone: String(payload.client_phone ?? ""),
    service_type: String(payload.service_type ?? "") as MaintenanceServiceType,
    description: String(payload.description ?? ""),
    priority: String(payload.priority ?? "medium") as MaintenancePriority,
    channel: "external-chatbot",
  });

  if (!result.ok) {
    return {
      ok: true,
      handled: false,
      action: "create",
      response_text:
        "لإرسال طلب صيانة أحتاج اسم العميل، رقم الهاتف، نوع الخدمة، ووصف المشكلة بشكل واضح.",
      error: "error" in result ? result.error : "missing data",
      missing_fields: "missingFields" in result ? result.missingFields : undefined,
    };
  }

  return {
    ok: true,
    handled: true,
    action: "create",
    response_text: summarizeCreatedRequest(result.data),
    data: result.data,
  };
};

const buildQueryResponse = async (payload: Record<string, unknown>, text: string) => {
  const requestNumber =
    String(payload.request_number ?? "").trim() ||
    (isValidRequestNumber(text.trim().toUpperCase()) ? text.trim().toUpperCase() : "");
  const clientPhone =
    String(payload.client_phone ?? "").trim() ||
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
      error: "error" in result ? result.error : "invalid query",
    };
  }

  return {
    ok: true,
    handled: true,
    action: "query",
    response_text: summarizeQueryResult(result.data),
    data: result.data,
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

  try {
    const rawBody = await req.text();
    const verified = await verifyWebhookRequest(req, rawBody);

    if (!verified) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized webhook request" }),
        { status: 401, headers: jsonHeaders },
      );
    }

    const payload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
    const text =
      String(
        payload.message ??
        payload.text ??
        payload.user_message ??
        payload.prompt ??
        "",
      ).trim();

    const action = detectAction(payload, text);

    if (action === "create") {
      return new Response(JSON.stringify(await buildCreateResponse(payload)), {
        headers: jsonHeaders,
      });
    }

    if (action === "query") {
      return new Response(JSON.stringify(await buildQueryResponse(payload, text)), {
        headers: jsonHeaders,
      });
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
    console.error("chatbot-endpoint error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
