import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonHeaders } from "../_shared/cors.ts";
import {
  getMetaConfig,
  requireNotificationAuth,
  sendWhatsAppNotification,
  type WhatsAppTemplateComponent,
} from "../_shared/meta.ts";

interface NotificationRequestBody {
  channel?: string;
  to?: string;
  type?: "text" | "template";
  text?: string;
  preview_url?: boolean;
  template_name?: string;
  language_code?: string;
  components?: WhatsAppTemplateComponent[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const config = getMetaConfig();

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        ok: true,
        status: "system notifications ready",
        channel: "whatsapp",
      }),
      { headers: jsonHeaders },
    );
  }

  if (!requireNotificationAuth(req, config.systemNotificationsToken)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  try {
    const body = await req.json() as NotificationRequestBody;
    const channel = String(body.channel || "whatsapp").toLowerCase();

    if (channel !== "whatsapp") {
      return new Response(JSON.stringify({ ok: false, error: "Unsupported channel" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const response = await sendWhatsAppNotification({
      to: String(body.to || ""),
      type: body.type || "text",
      text: body.text,
      previewUrl: body.preview_url,
      templateName: body.template_name,
      languageCode: body.language_code,
      components: body.components,
    }, config);

    return new Response(
      JSON.stringify({
        ok: true,
        channel,
        response,
      }),
      { headers: jsonHeaders },
    );
  } catch (error) {
    console.error("system-notifications error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
});
