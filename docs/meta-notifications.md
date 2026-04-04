# Meta And WhatsApp Notifications

## Scope

This project now includes a production-ready Meta and WhatsApp notification layer for:

- webhook verification
- inbound WhatsApp event intake
- Meta data deletion callback
- outbound system notifications through WhatsApp Business

## Supabase Functions

- `meta-webhook`
- `meta-data-deletion`
- `notifications-gateway`

## Required Secrets

- `SITE_URL`
- `FB_APP_ID`
- `FB_APP_SECRET`
- `META_BUSINESS_ID`
- `META_ASSET_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_BUSINESS_NUMBER`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `META_WEBHOOK_VERIFY_TOKEN`
- `SYSTEM_NOTIFICATIONS_TOKEN`
- `META_EVENTS_FORWARD_URL` optional
- `META_EVENTS_FORWARD_TOKEN` optional

## Access Token Requirements

The WhatsApp sending layer requires an access token that actually includes WhatsApp permissions such as:

- `whatsapp_business_messaging`
- `whatsapp_business_management`
- `business_management` when business asset discovery is needed

If the token lacks these permissions, webhook verification can still work, but outbound notifications and business asset discovery will fail.

## Public URLs

Recommended public paths:

```text
https://luxury-finishing.alazab.com/api/v1/meta/webhook
https://luxury-finishing.alazab.com/api/v1/meta/data-deletion
https://luxury-finishing.alazab.com/api/v1/notifications/system
```

Recommended reverse proxy targets:

```text
/api/v1/meta/webhook
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/meta-webhook

/api/v1/meta/data-deletion
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/meta-data-deletion

/api/v1/notifications/system
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/notifications-gateway
```

## Webhook Verification

The `meta-webhook` function supports the standard Meta GET verification flow using:

- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

`META_WEBHOOK_VERIFY_TOKEN` must match the token entered in the Meta dashboard.

## Signature Validation

POST webhook payloads validate `x-hub-signature-256` against `FB_APP_SECRET`.

## Normalized Event Intake

The webhook normalizes:

- inbound messages
- delivery statuses
- unknown change payloads

If `META_EVENTS_FORWARD_URL` is configured, the normalized payload is forwarded to the internal system for downstream workflows.

## System Notifications Endpoint

Authentication:

- `Authorization: Bearer <SYSTEM_NOTIFICATIONS_TOKEN>`
- or `x-api-key: <SYSTEM_NOTIFICATIONS_TOKEN>`

### Text Message Example

```json
{
  "channel": "whatsapp",
  "to": "+201001234567",
  "type": "text",
  "text": "تم تحديث حالة طلب الصيانة الخاص بك.",
  "preview_url": false
}
```

### Template Message Example

```json
{
  "channel": "whatsapp",
  "to": "+201001234567",
  "type": "template",
  "template_name": "maintenance_status_update",
  "language_code": "ar",
  "components": [
    {
      "type": "body",
      "parameters": [
        { "type": "text", "text": "MR-26-00012" },
        { "type": "text", "text": "جاري المعالجة" }
      ]
    }
  ]
}
```

## Data Deletion Callback

The `meta-data-deletion` function accepts `signed_request`, validates it against `FB_APP_SECRET`, and returns:

- `url`
- `confirmation_code`

The returned URL points to the public `/data-deletion` page with a confirmation code query string.
