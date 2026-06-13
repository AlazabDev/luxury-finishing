import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";

// Light in-memory rate limiter to slow abuse from a single IP.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const ipHits = new Map<string, { count: number; reset: number }>();

const clientIp = (req: Request): string => {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
};

const rateLimit = (ip: string): boolean => {
  const now = Date.now();
  const b = ipHits.get(ip);
  if (!b || b.reset < now) {
    ipHits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  b.count += 1;
  return b.count <= RATE_MAX;
};

const hashIp = async (ip: string): Promise<string> => {
  const data = new TextEncoder().encode(ip + (Deno.env.get("SUPABASE_URL") ?? ""));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errorResponse = (status: number, error: string) =>
  new Response(JSON.stringify({ success: false, error }), { status, headers: jsonHeaders });

const notify = async (payload: Record<string, unknown>) => {
  // Best-effort admin notification via system-notifications if configured.
  const token = Deno.env.get("SYSTEM_NOTIFICATIONS_TOKEN");
  const url = Deno.env.get("SUPABASE_URL");
  if (!token || !url) return;
  try {
    await fetch(`${url}/functions/v1/system-notifications`, {
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
    });
  } catch (e) {
    console.warn("notify failed:", e instanceof Error ? e.message : e);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorResponse(405, "Method not allowed");

  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    console.log(JSON.stringify({ fn: "submit-contact-message", event: "rate_limited", ip }));
    return errorResponse(429, "Too many requests. Please slow down.");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "Invalid JSON body");
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const propertyType = String(body.propertyType ?? body.property_type ?? "").trim();
  const area = String(body.area ?? "").trim().slice(0, 50) || null;
  const message = String(body.message ?? "").trim();
  const locale = typeof body.locale === "string" ? body.locale.slice(0, 10) : null;

  if (name.length < 1 || name.length > 100) return errorResponse(400, "Invalid name");
  if (!emailRe.test(email) || email.length > 255) return errorResponse(400, "Invalid email");
  if (phone.length < 5 || phone.length > 20) return errorResponse(400, "Invalid phone");
  if (propertyType.length < 1 || propertyType.length > 50) return errorResponse(400, "Invalid property type");
  if (message.length < 1 || message.length > 2000) return errorResponse(400, "Invalid message");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("LF_SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return errorResponse(500, "Server misconfigured");

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const ip_hash = await hashIp(ip);
  const user_agent = (req.headers.get("user-agent") ?? "").slice(0, 500);

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
      user_agent,
      ip_hash,
      source: "contact_page",
      status: "new",
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error(JSON.stringify({ fn: "submit-contact-message", event: "db_error", message: error.message }));
    return errorResponse(500, "Could not save your message. Please try again.");
  }

  console.log(JSON.stringify({ fn: "submit-contact-message", event: "stored", id: data?.id, ip }));

  // Fire-and-forget admin notification.
  notify({ id: data?.id, name, email, phone, property_type: propertyType, message }).catch(() => {});

  return new Response(JSON.stringify({ success: true, id: data?.id }), { headers: jsonHeaders });
});
