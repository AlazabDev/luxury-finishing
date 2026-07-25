import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createRateLimiter, exceedsContentLength } from "../_shared/rate-limit.ts";

const MAX_TTS_CHARS = 1_200;
const rateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

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

  if (exceedsContentLength(req, 8_000)) {
    return errorResponse(413, "Request body is too large");
  }

  const limit = rateLimit(req);
  if (!limit.allowed) {
    return errorResponse(429, "Too many speech requests", limit.retryAfterSeconds);
  }

  try {
    const body = await req.json().catch(() => null) as { text?: unknown } | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return errorResponse(400, "text is required");
    }

    if (text.length > MAX_TTS_CHARS) {
      return errorResponse(413, `text exceeds ${MAX_TTS_CHARS} character limit`);
    }

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY")?.trim();
    if (!elevenLabsApiKey) {
      console.error("TTS configuration error: ELEVENLABS_API_KEY is missing");
      return errorResponse(503, "Speech service is temporarily unavailable");
    }

    const voiceId = Deno.env.get("ELEVENLABS_VOICE_ID")?.trim() || "FGY2WhTYpPnrIDTdsKH5";
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );

    if (!response.ok) {
      const upstreamError = await response.text();
      console.error("ElevenLabs TTS error:", response.status, upstreamError.slice(0, 1_000));
      return errorResponse(response.status === 429 ? 429 : 502, "فشل تحويل النص لصوت");
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-store",
        "Content-Length": String(audioBuffer.byteLength),
        "Content-Type": "audio/mpeg",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("TTS error:", error instanceof Error ? error.message : error);
    return errorResponse(500, "Internal server error");
  }
});
