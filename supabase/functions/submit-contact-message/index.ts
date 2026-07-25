import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonHeaders as sharedJsonHeaders } from "../_shared/cors.ts";
import { createRateLimiter, exceedsContentLength, getClientIp } from "../_shared/rate-limit.ts";

const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+\d][\d\s()-]{4,19}$/;

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

const hashIp = async (ip: string): Promise<string> => {
  const salt =
    Deno.env.get("CONTACT_IP_HASH_SALT")?.trim() ||
    Deno.env.get("SUPABASE_URL")?.trim() ||
    "contact-form";
  const data = new TextEncoder().encode(`${ip}:${salt}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
};

const notify = async (payload: Record<string, unknown>) => {
  const token = Deno.env.get("SYSTEM_NOTIFICATIONS_TOKEN")?.trim();
  const url = Deno.env.get("SUPABASE_URL")?.trim();
  if (!token || !url) return;

  try {
    await fetch(`${url.replace(/\/+$/, "")}/functions/v1/system-notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "contact_message",
        channel: "email",
        payload,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.warn("contact notification failed:", error instanceof Error ? error.message : error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse(405, "Method not allowed");
  if (exceedsContentLength(req, 12_000)) return errorResponse(413, "Request body is too large");

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many requests. Please slow down.", limit.retryAfterSeconds);
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return errorResponse(400, "Invalid JSON body");

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const propertyType = String(body.propertyType ?? body.property_type ?? "").trim();
  const area = String(body.area ?? "").trim().slice(0, 50) || null;
  const message = String(body.message ?? "").trim();
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 10) : null;
  const honeypot = String(body.website ?? body.company_website ?? "").trim();

  if (honeypot) {
    return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
  }
  if (name.length < 2 || name.length > 100) return errorResponse(400, "Invalid name");
  if (!emailRe.test(email) || email.length > 255) return errorResponse(400, "Invalid email");
  if (!phoneRe.test(phone)) return errorResponse(400, "Invalid phone");
  if (propertyType.length < 1 || propertyType.length > 50) return errorResponse(400, "Invalid property type");
  if (message.length < 5 || message.length > 2_000) return errorResponse(400, "Invalid message");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
    Deno.env.get("LF_SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceKey) {
    console.error("submit-contact-message configuration error");
    return errorResponse(503, "Service is temporarily unavailable");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ipHash = await hashIp(getClientIp(req));
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 500);

  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      phone,
      property_type: propertyType,
      area,
      message,
      locale,
      user_agent: userAgent,
      ip_hash: ipHash,
      source: "contact_page",
      status: "new",
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("submit-contact-message database error:", error.code || "unknown");
    return errorResponse(500, "Could not save your message. Please try again.");
  }

  notify({
    id: data?.id,
    name,
    email,
    phone,
    property_type: propertyType,
    message,
  }).catch(() => {});

  return new Response(
    JSON.stringify({ success: true, id: data?.id }),
    { headers: jsonHeaders },
  );
});
