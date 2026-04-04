const GRAPH_API_BASE = "https://graph.facebook.com/v22.0";

const textEncoder = new TextEncoder();

const getOptionalEnv = (name: string) => Deno.env.get(name)?.trim() || "";

const getRequiredEnv = (name: string) => {
  const value = getOptionalEnv(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const timingSafeEqual = (left: string, right: string) => {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);

  if (leftBytes.length !== rightBytes.length) return false;

  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }

  return result === 0;
};

const base64UrlToUint8Array = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const decoded = atob(`${normalized}${padding}`);
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};

const createHmacSha256Hex = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return toHex(signature);
};

const createHmacSha256Bytes = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return new Uint8Array(signature);
};

export interface MetaConfig {
  appId: string;
  appSecret: string;
  businessId: string;
  assetId: string;
  accessToken: string;
  webhookVerifyToken: string;
  systemNotificationsToken: string;
  phoneNumberId: string;
  wabaId: string;
  businessNumber: string;
  siteUrl: string;
  eventsForwardUrl?: string;
  eventsForwardToken?: string;
}

export const getMetaConfig = (): MetaConfig => ({
  appId: getOptionalEnv("FB_APP_ID"),
  appSecret: getOptionalEnv("FB_APP_SECRET"),
  businessId: getOptionalEnv("META_BUSINESS_ID"),
  assetId: getOptionalEnv("META_ASSET_ID"),
  accessToken: getOptionalEnv("WHATSAPP_ACCESS_TOKEN"),
  webhookVerifyToken: getOptionalEnv("META_WEBHOOK_VERIFY_TOKEN"),
  systemNotificationsToken: getOptionalEnv("SYSTEM_NOTIFICATIONS_TOKEN"),
  phoneNumberId:
    getOptionalEnv("WHATSAPP_PHONE_NUMBER_ID") || getOptionalEnv("META_ASSET_ID"),
  wabaId: getOptionalEnv("WHATSAPP_BUSINESS_ACCOUNT_ID"),
  businessNumber: getOptionalEnv("WHATSAPP_BUSINESS_NUMBER"),
  siteUrl: getOptionalEnv("SITE_URL") || "https://luxury-finishing.alazab.com",
  eventsForwardUrl: getOptionalEnv("META_EVENTS_FORWARD_URL") || undefined,
  eventsForwardToken: getOptionalEnv("META_EVENTS_FORWARD_TOKEN") || undefined,
});

export const requireNotificationAuth = (req: Request, expectedToken: string) => {
  const bearerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const apiKey = req.headers.get("x-api-key")?.trim();
  const providedToken = bearerToken || apiKey || "";
  return expectedToken ? timingSafeEqual(providedToken, expectedToken) : false;
};

export const verifyMetaWebhookSignature = async (
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
) => {
  if (!appSecret) return true;
  if (!signatureHeader) return false;

  const normalizedSignature = signatureHeader.replace(/^sha256=/i, "");
  const computedSignature = await createHmacSha256Hex(appSecret, rawBody);
  return timingSafeEqual(normalizedSignature, computedSignature);
};

export const verifySignedRequest = async (signedRequest: string, appSecret: string) => {
  const [encodedSignature, encodedPayload] = signedRequest.split(".");
  if (!encodedSignature || !encodedPayload) {
    throw new Error("Invalid signed_request format");
  }

  const providedSignature = base64UrlToUint8Array(encodedSignature);
  const expectedSignature = await createHmacSha256Bytes(appSecret, encodedPayload);

  if (providedSignature.length !== expectedSignature.length) {
    throw new Error("Invalid signed_request signature");
  }

  let result = 0;
  for (let index = 0; index < providedSignature.length; index += 1) {
    result |= providedSignature[index] ^ expectedSignature[index];
  }

  if (result !== 0) throw new Error("Invalid signed_request signature");

  const payloadBytes = base64UrlToUint8Array(encodedPayload);
  const payloadText = new TextDecoder().decode(payloadBytes);
  return JSON.parse(payloadText) as Record<string, unknown>;
};

const normalizeRecipient = (value: string) => value.replace(/[^\d]/g, "");

export interface WhatsAppTemplateComponent {
  type: string;
  parameters?: Array<Record<string, unknown>>;
  sub_type?: string;
  index?: string;
}

export interface SendWhatsAppNotificationPayload {
  to: string;
  type: "text" | "template";
  text?: string;
  previewUrl?: boolean;
  templateName?: string;
  languageCode?: string;
  components?: WhatsAppTemplateComponent[];
}

export const sendWhatsAppNotification = async (
  payload: SendWhatsAppNotificationPayload,
  config = getMetaConfig(),
) => {
  const accessToken = config.accessToken || getRequiredEnv("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = config.phoneNumberId || getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  const to = normalizeRecipient(payload.to);

  if (!to) throw new Error("Recipient phone number is required");

  let body: Record<string, unknown>;

  if (payload.type === "template") {
    if (!payload.templateName) throw new Error("templateName is required for template messages");

    body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: payload.templateName,
        language: {
          code: payload.languageCode || "ar",
        },
        components: payload.components || [],
      },
    };
  } else {
    if (!payload.text?.trim()) throw new Error("text is required for text messages");

    body = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: payload.text.trim(),
        preview_url: Boolean(payload.previewUrl),
      },
    };
  }

  const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let responseJson: Record<string, unknown> = {};
  if (responseText) {
    try {
      responseJson = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      responseJson = { raw: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(`Meta API error [${response.status}]: ${responseText}`);
  }

  return responseJson;
};

export interface MetaWebhookEvent {
  kind: "message" | "status" | "unknown";
  field: string;
  from?: string;
  messageId?: string;
  messageType?: string;
  text?: string;
  status?: string;
  recipientId?: string;
  timestamp?: string;
  raw: Record<string, unknown>;
}

export const normalizeMetaWebhookPayload = (payload: Record<string, unknown>) => {
  const events: MetaWebhookEvent[] = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray((entry as Record<string, unknown>).changes)
      ? ((entry as Record<string, unknown>).changes as Record<string, unknown>[])
      : [];

    for (const change of changes) {
      const field = String(change.field || "unknown");
      const value = (change.value as Record<string, unknown>) || {};
      const messages = Array.isArray(value.messages) ? (value.messages as Record<string, unknown>[]) : [];
      const statuses = Array.isArray(value.statuses) ? (value.statuses as Record<string, unknown>[]) : [];

      for (const message of messages) {
        events.push({
          kind: "message",
          field,
          from: String(message.from || ""),
          messageId: String(message.id || ""),
          messageType: String(message.type || ""),
          text: String(((message.text as Record<string, unknown>) || {}).body || ""),
          timestamp: String(message.timestamp || ""),
          raw: message,
        });
      }

      for (const status of statuses) {
        events.push({
          kind: "status",
          field,
          messageId: String(status.id || ""),
          status: String(status.status || ""),
          recipientId: String(status.recipient_id || ""),
          timestamp: String(status.timestamp || ""),
          raw: status,
        });
      }

      if (!messages.length && !statuses.length) {
        events.push({
          kind: "unknown",
          field,
          raw: value,
        });
      }
    }
  }

  return events;
};

export const forwardMetaEvents = async (
  normalizedEvents: MetaWebhookEvent[],
  rawPayload: Record<string, unknown>,
  config = getMetaConfig(),
) => {
  if (!config.eventsForwardUrl) return false;

  await fetch(config.eventsForwardUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.eventsForwardToken
        ? { Authorization: `Bearer ${config.eventsForwardToken}` }
        : {}),
    },
    body: JSON.stringify({
      source: "meta-webhook",
      received_at: new Date().toISOString(),
      events: normalizedEvents,
      payload: rawPayload,
    }),
  });

  return true;
};
