# API Routing Map

## Public URL Design

The public API layout for `luxury-finishing.alazab.com` is organized as follows:

```text
https://luxury-finishing.alazab.com/api/v1/auth/hooks
https://luxury-finishing.alazab.com/api/v2/whatsapp/hooks
https://luxury-finishing.alazab.com/api/maintenance/gateway
```

## Supabase Function Mapping

```text
/api/v1/auth/hooks
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/auth-hooks

/api/v2/whatsapp/hooks
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/whatsapp-hooks

/api/maintenance/gateway
  -> https://lnoyiwrulvoaaerpiqxc.supabase.co/functions/v1/maintenance-gateway-api
```

## Route Responsibilities

### `v1/auth/hooks`

Use for:

- authentication callbacks
- identity provider hooks
- signed or tokenized auth-related events

Security options:

- `Authorization: Bearer <AUTH_HOOKS_TOKEN>`
- `x-api-key: <AUTH_HOOKS_TOKEN>`
- `x-webhook-secret: <AUTH_HOOKS_SECRET>`
- `x-signature: sha256=<HMAC_SHA256(raw_body, AUTH_HOOKS_SECRET)>`

### `v2/whatsapp/hooks`

Use for:

- Meta webhook verification
- WhatsApp inbound event intake
- normalized WhatsApp event forwarding

Verification:

- `hub.verify_token` must match `WHATSAPP_HOOKS_VERIFY_TOKEN` or `META_WEBHOOK_VERIFY_TOKEN`
- `x-hub-signature-256` is validated against `WHATSAPP_APP_SECRET` or `FB_APP_SECRET`

### `maintenance/gateway`

Use for:

- create maintenance requests
- query maintenance requests
- internal or external maintenance integrations

Methods:

- `GET /api/maintenance/gateway`
- `GET /api/maintenance/gateway?request_number=MR-26-00012`
- `GET /api/maintenance/gateway?client_phone=01012345678`
- `POST /api/maintenance/gateway`

Optional security:

- `Authorization: Bearer <MAINTENANCE_GATEWAY_TOKEN>`
- `x-api-key: <MAINTENANCE_GATEWAY_TOKEN>`
- `x-webhook-secret: <MAINTENANCE_GATEWAY_SECRET>`
- `x-signature: sha256=<HMAC_SHA256(raw_body, MAINTENANCE_GATEWAY_SECRET)>`

## Example Nginx Reverse Proxy

See:

- `deploy/nginx/luxury-finishing-api.conf`
