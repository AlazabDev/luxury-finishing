import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { SYSTEM_PROMPT } from "../_shared/chat.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const MAX_MESSAGES = 30;
const MAX_CONTENT_CHARS = 2_000;
const MAX_TOTAL_CONTENT_CHARS = 12_000;
const MAX_BODY_BYTES = 40_000;
const allowedRoles = new Set(["user", "assistant"]);
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 12 });

const jsonHeaders = {
  ...corsHeaders,
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const errorResponse = (status: number, error: string, retryAfterSeconds?: number) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...jsonHeaders,
      ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed");
  }

  if (exceedsContentLength(req, MAX_BODY_BYTES)) {
    return errorResponse(413, "Request body is too large");
  }

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many requests. Please try again shortly.", limit.retryAfterSeconds);
  }

  try {
    const body = await req.json().catch(() => null) as { messages?: unknown } | null;
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse(400, "messages must be a non-empty array");
    }

    if (messages.length > MAX_MESSAGES) {
      return errorResponse(413, `Too many messages (max ${MAX_MESSAGES})`);
    }

    const safeMessages = messages
      .map((item) => {
        const message = item && typeof item === "object" ? item as Record<string, unknown> : {};
        const role = typeof message.role === "string" && allowedRoles.has(message.role)
          ? message.role
          : "user";
        const content = String(message.content ?? "").trim().slice(0, MAX_CONTENT_CHARS);
        return { role, content };
      })
      .filter((message) => message.content.length > 0);

    if (!safeMessages.length || !safeMessages.some((message) => message.role === "user")) {
      return errorResponse(400, "At least one user message is required");
    }

    const totalContentLength = safeMessages.reduce((total, message) => total + message.content.length, 0);
    if (totalContentLength > MAX_TOTAL_CONTENT_CHARS) {
      return errorResponse(413, "Conversation content is too large");
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")?.trim();
    if (!lovableApiKey) {
      console.error("chat configuration error: LOVABLE_API_KEY is missing");
      return errorResponse(503, "Chat service is temporarily unavailable");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("LOVABLE_CHAT_MODEL")?.trim() || "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        stream: true,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      const upstreamBody = await response.text();
      console.error("AI gateway error:", response.status, upstreamBody.slice(0, 1_000));

      if (response.status === 429) {
        return errorResponse(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً.");
      }
      if (response.status === 402) {
        return errorResponse(503, "خدمة المحادثة غير متاحة مؤقتاً.");
      }
      return errorResponse(502, "حدث خطأ في خدمة المحادثة");
    }

    if (!response.body) {
      return errorResponse(502, "Chat service returned an empty response");
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-cache, no-store",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("chat error:", error instanceof Error ? error.message : error);
    return errorResponse(500, "Internal server error");
  }
});
