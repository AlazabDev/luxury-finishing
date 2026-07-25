import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const MAX_STT_BYTES = 5 * 1024 * 1024;
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 6 });
const allowedAudioTypes = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/x-m4a",
  "audio/m4a",
]);

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

  if (exceedsContentLength(req, MAX_STT_BYTES + 128 * 1024)) {
    return errorResponse(413, "Audio upload exceeds the allowed size");
  }

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many transcription requests", limit.retryAfterSeconds);
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File) || audioFile.size === 0) {
      return errorResponse(400, "audio file required");
    }

    if (audioFile.size > MAX_STT_BYTES) {
      return errorResponse(413, "audio file exceeds 5MB limit");
    }

    const audioType = audioFile.type.toLowerCase();
    if (!audioType || !allowedAudioTypes.has(audioType)) {
      return errorResponse(400, "unsupported audio type");
    }

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY")?.trim();
    if (!elevenLabsApiKey) {
      console.error("STT configuration error: ELEVENLABS_API_KEY is missing");
      return errorResponse(503, "Speech service is temporarily unavailable");
    }

    const apiFormData = new FormData();
    apiFormData.append("file", audioFile);
    apiFormData.append("model_id", "scribe_v2");
    apiFormData.append("language_code", "ara");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": elevenLabsApiKey },
      body: apiFormData,
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      const upstreamError = await response.text();
      console.error("ElevenLabs STT error:", response.status, upstreamError.slice(0, 1_000));
      return errorResponse(response.status === 429 ? 429 : 502, "فشل تحويل الصوت لنص");
    }

    const transcription = await response.json();
    return new Response(JSON.stringify(transcription), { headers: jsonHeaders });
  } catch (error) {
    console.error("STT error:", error instanceof Error ? error.message : error);
    return errorResponse(500, "Internal server error");
  }
});
