
# Luxury Finishing

![Alazab Construction](https://al-azab.co/logo-alazab.gif)

## Overview

**Luxury Finishing** is the premium execution and finishing platform of **Alazab Construction Company**, developed to present high-end residential and commercial finishing services with clarity, confidence, and strong brand identity.

This project represents the refined execution arm of the Alazab ecosystem, with a focus on delivering elegant spaces, disciplined implementation, and a customer experience built on trust, quality, and visual excellence.

---

## About Alazab

**Al-azab.co هي شركة متخصصة في التصميم المعماري والداخلي تقدم حلولاً سكنية وتجارية وضيافة منذ عام 2020. الشركة تلتزم بتقديم أفكار عالية الجودة ومريحة، وتوفر خدمات تشمل التصميم المعماري والداخلي وتنفيذ المشاريع وتطبيقها.**

Luxury Finishing reflects the premium finishing direction of the company and serves as one of the main brand pillars within the broader Alazab structure.

---

## Core Purpose

This project is designed to present and support the luxury finishing identity of the business through a professional digital presence that communicates:

- execution quality
- visual elegance
- technical confidence
- service clarity
- brand trust

It is intended to be more than a marketing site. It should function as a refined brand interface that supports customer conversion, project presentation, and long-term positioning.

---

## Main Focus Areas

### Premium Brand Presentation
- present the Luxury Finishing identity with a strong and elegant visual standard
- communicate the company’s execution quality with clarity
- reinforce trust through a polished digital presence

### Service Communication
- explain finishing services in a structured and professional way
- support residential and commercial customer journeys
- improve how service value is presented to potential clients

### Project Showcase
- display selected work with strong visual hierarchy
- reflect quality, precision, and material awareness
- support future case studies and portfolio expansion

### Business Alignment
- align the digital presence with the broader Alazab brand system
- maintain consistency with company standards
- support integration with future internal systems and service flows

---

## Technology Stack

This project is built with:

- **Vite**
- **TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui**

---

## Development

### Requirements

- Node.js 18+
- pnpm or npm

### Install

```bash
git clone <YOUR_REPOSITORY_URL>
cd luxury-finishing
pnpm install
```

### Environment

Create `.env` from `.env.example` and set:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LF_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ELEVENLABS_AGENT_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_ASSET_FOLDER`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `PROJECT_PRIMARY_EMAIL`
- `MAIL_IMAP_HOST`
- `MAIL_IMAP_PORT`
- `MAIL_IMAP_USER`
- `MAIL_IMAP_PASSWORD`
- `MAIL_SMTP_HOST`
- `MAIL_SMTP_PORT`
- `MAIL_SMTP_USER`
- `MAIL_SMTP_PASSWORD`
- `FB_APP_ID`
- `FB_APP_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `META_WEBHOOK_VERIFY_TOKEN`
- `SYSTEM_NOTIFICATIONS_TOKEN`

### Project Integration Email

The primary operational mailbox for this project is `lf@alazab.com`.

Recommended baseline:

- provider: `Migadu`
- IMAP over TLS on port `993`
- SMTP over TLS on port `465`
- SMTP StartTLS fallback on port `587`
- webmail: [webmail.migadu.com](https://webmail.migadu.com)

Store mailbox credentials only in local `.env` files, deployment secrets, or secret managers. Do not commit mailbox passwords.

If your deployment platform blocks secret names that start with `SUPABASE_`, use `LF_SUPABASE_SERVICE_ROLE_KEY` as the production alias.

### Meta And WhatsApp Production Setup

Production publishing now includes:

- public legal URLs:
  - `/legal`
  - `/privacy`
  - `/terms`
  - `/cookies`
  - `/data-deletion`
  - `/channels`
- Meta webhook receiver for verification and event intake
- Meta data deletion callback endpoint
- secured system notification endpoint for WhatsApp Business

Recommended public reverse proxy mapping:

- `https://luxury-finishing.alazab.com/api/v1/meta/webhook`
- `https://luxury-finishing.alazab.com/api/v1/meta/data-deletion`
- `https://luxury-finishing.alazab.com/api/v1/notifications/system`
- `https://luxury-finishing.alazab.com/api/v1/auth/hooks`
- `https://luxury-finishing.alazab.com/api/v2/whatsapp/hooks`
- `https://luxury-finishing.alazab.com/api/maintenance/gateway`

API route organization is documented in [docs/api-routing.md](./docs/api-routing.md).
Facebook SDK frontend setup is documented in [docs/facebook-sdk.md](./docs/facebook-sdk.md).

### Cloudinary Production Setup

The site now builds image delivery URLs dynamically from Cloudinary public IDs under the `luxury-finishing` asset folder.

Required upload preset settings:

- `overwrite: false`
- `use filename: true`
- `unique filename: false`
- `use asset folder as public id prefix: true`
- `asset folder: luxury-finishing`

Recommended public ID layout:

- `luxury-finishing/retail-interiors/retail-interiors-001`
- `luxury-finishing/shops/shops-001`
- `luxury-finishing/abuauf/abuauf_1`

### Build

```bash
pnpm build
```

### PM2 Deployment On Port 3007

This project now includes:

- PM2 ecosystem file: `ecosystem.config.cjs`
- production static server with SPA fallback: `scripts/serve-dist.mjs`
- automatic deployment script: `scripts/deploy-pm2.ps1`

Recommended commands:

```bash
pnpm deploy:pm2
pm2 status
pm2 logs luxury-finishing
```

If you want to skip dependency install during redeploy:

```bash
powershell -ExecutionPolicy Bypass -File ./scripts/deploy-pm2.ps1 -SkipInstall
```

The application listens on:

```text
http://0.0.0.0:3007
```

### Test

```bash
pnpm test
```

## Chatbot And Maintenance Integration

The chatbot now supports:

- general AI assistance
- guided maintenance request creation
- maintenance request status lookup
- optional ElevenLabs live voice sessions for maintenance intake and lookup
- external webhook handling through `chatbot-endpoint`

Integration notes are documented in [docs/chatbot-integration.md](./docs/chatbot-integration.md).


