# Chatbot Integration

## Scope

The project now supports:

- website chatbot conversations
- guided maintenance request creation
- maintenance request status lookup
- optional ElevenLabs live voice agent integration inside the website chatbot
- external webhook integration through a dedicated Supabase Edge Function

## Supabase Functions

- `chat`
- `maintenance-proxy`
- `chatbot-endpoint`
- `chat-attachments`
- `meta-webhook`
- `meta-data-deletion`
- `system-notifications`

## Required Secrets

Set these as Supabase function secrets or hosting environment variables. Do not commit real values into the repository.

- `LOVABLE_API_KEY`
- `MAINTENANCE_API_URL`
- `MAINTENANCE_API_KEY`
- `CHATBOT_TOKEN`
- `CHATBOT_WEBHOOK_SECRET`
- `VITE_ELEVENLABS_AGENT_ID`
- `SEAFILE_URL`
- `SEAFILE_TOKEN`
- `SEAFILE_REPO_ID`
- `PROJECT_PRIMARY_EMAIL`
- `PROJECT_PRIMARY_EMAIL_NAME`
- `LF_SUPABASE_SERVICE_ROLE_KEY`
- `MAIL_PROVIDER`
- `MAIL_REPLY_TO`
- `MAIL_WEBMAIL_URL`
- `MAIL_IMAP_HOST`
- `MAIL_IMAP_PORT`
- `MAIL_IMAP_SECURE`
- `MAIL_IMAP_USER`
- `MAIL_IMAP_PASSWORD`
- `MAIL_SMTP_HOST`
- `MAIL_SMTP_PORT`
- `MAIL_SMTP_SECURE`
- `MAIL_SMTP_USER`
- `MAIL_SMTP_PASSWORD`
- `MAIL_SMTP_STARTTLS_PORT`

## External Maintenance API

Expected upstream API base:

```text
https://zrrffsjbfkphridqyais.supabase.co/functions/v1
```

Used routes:

- `POST /maintenance-gateway`
- `GET /query-maintenance-requests?request_number=MR-25-00042`
- `GET /query-maintenance-requests?client_phone=01xxxxxxxxx`

## Website Chatbot Flow

The website chatbot now handles maintenance in a guided flow:

1. collect client name
2. collect phone number
3. choose service type
4. collect issue description
5. choose priority
6. confirm submission

It also supports direct status lookup by:

- request number
- client phone number

## ElevenLabs Voice Layer

The website chatbot now exposes an optional live voice panel when `VITE_ELEVENLABS_AGENT_ID` is configured in the frontend environment.

Frontend behavior:

- renders a direct voice call control inside the chatbot
- starts an ElevenLabs voice session from the browser
- keeps the current text chatbot flow as a fallback
- uses the same maintenance proxy endpoints already used by the text flow
- uploads user attachments through `chat-attachments` before sending the message

The runtime prompt instructs the voice agent to:

- speak Arabic professionally
- collect missing maintenance fields only
- create a maintenance request when the required fields are complete
- query an existing request by request number or client phone

## ElevenLabs Client Tools

Configure these tool names on the ElevenLabs agent so the voice session can execute real maintenance actions:

- `create_maintenance_request`
- `query_maintenance_request`

Expected tool payloads:

```json
{
  "client_name": "أحمد محمد",
  "client_phone": "01012345678",
  "service_type": "electrical",
  "description": "عطل في الكهرباء",
  "priority": "high"
}
```

```json
{
  "request_number": "MR-25-00042"
}
```

or:

```json
{
  "client_phone": "01012345678"
}
```

Validation rules applied in the website before forwarding:

- phone numbers must match `01xxxxxxxxx`
- request numbers must match `MR-25-00042`
- service type must be one of `plumbing`, `electrical`, `ac`, `painting`, `carpentry`, `general`
- priority must be one of `low`, `medium`, `high`

## Seafile Attachment Storage

Chatbot attachments now use a dedicated Seafile library through the `chat-attachments` Supabase Edge Function.

Current storage design:

- provider: `Seafile`
- repo name: `Luxury Finishing Chatbot`
- root directory: `/chatbot-attachments`
- generated path pattern: `/chatbot-attachments/chatbot/YYYY/MM/<conversation-id>/timestamp-file.ext`

Each uploaded attachment returns:

- public share URL
- repository path
- original file metadata

The frontend then:

- stores the uploaded URL in the current chat message
- includes the file link in the AI context
- keeps the attachment inside local conversation history
- exports the link inside downloaded transcript files

## Project Mail Identity

The primary project mailbox is `lf@alazab.com` on `Migadu`.

Recommended operational use:

- register external integrations under the project mailbox identity
- use the same mailbox as the default sender and `reply-to`
- keep IMAP and SMTP credentials in Supabase secrets or hosting secrets only
- avoid embedding mailbox passwords in frontend-exposed variables
- if the platform blocks `SUPABASE_SERVICE_ROLE_KEY`, use `LF_SUPABASE_SERVICE_ROLE_KEY`

Baseline transport:

- IMAP TLS: `imap.migadu.com:993`
- SMTP TLS: `smtp.migadu.com:465`
- SMTP StartTLS fallback: `smtp.migadu.com:587`
- Webmail: `https://webmail.migadu.com`

## External Webhook Endpoint

Supabase function URL:

```text
https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/chatbot-endpoint
```

Recommended reverse proxy target for the public domain:

```text
https://luxury-finishing.alazab.com/api/v1/chatbot/endpoint
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/chatbot-endpoint
```

## Webhook Authentication

The endpoint accepts any of these methods:

1. `Authorization: Bearer <CHATBOT_TOKEN>`
2. `x-chatbot-token: <CHATBOT_TOKEN>`
3. `x-api-key: <CHATBOT_TOKEN>`
4. `x-webhook-secret: <CHATBOT_WEBHOOK_SECRET>`
5. `x-signature: sha256=<HMAC_SHA256(raw_body, CHATBOT_WEBHOOK_SECRET)>`

## Accepted Payload Patterns

The endpoint accepts flexible JSON payloads such as:

```json
{
  "action": "create",
  "client_name": "أحمد محمد",
  "client_phone": "01012345678",
  "service_type": "electrical",
  "description": "عطل في الكهرباء",
  "priority": "high"
}
```

```json
{
  "action": "query",
  "request_number": "MR-25-00042"
}
```

```json
{
  "text": "ما حالة الطلب MR-25-00042"
}
```

## Response Shape

Typical JSON response:

```json
{
  "ok": true,
  "handled": true,
  "action": "query",
  "response_text": "بيانات الطلب MR-25-00042: الحالة pending..."
}
```

## Deployment Notes

- `chatbot-endpoint` is configured with `verify_jwt = false`
- the website chatbot still uses the anonymous Supabase key to call `chat`, `tts`, `stt`, and `maintenance-proxy`
- the public webhook URL should be routed by the hosting layer or reverse proxy to the Supabase function URL
