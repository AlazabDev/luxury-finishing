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

- **Vite**
- **TypeScript**
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase Edge Functions**
- **PM2 + Nginx**

---

## Development

### Requirements

- Node.js 22
- pnpm 11 through Corepack

### Install

```bash
git clone https://github.com/AlazabDev/luxury-finishing.git
cd luxury-finishing
corepack enable
corepack prepare pnpm@11.13.1 --activate
pnpm install --frozen-lockfile
```

### Environment

Create `.env` from `.env.example` and set the required public and server-only values. Never commit `.env`, service-role keys, mailbox passwords, webhook secrets, or provider access tokens.

Key groups include:

- Supabase public and service-role configuration
- Cloudinary delivery configuration
- ElevenLabs agent and API configuration
- Migadu mailbox configuration
- Meta and WhatsApp webhook configuration
- maintenance gateway configuration
- Seafile attachment storage configuration

The primary operational mailbox for this project is `lf@alazab.com`.

If a deployment platform blocks secret names that start with `SUPABASE_`, use `LF_SUPABASE_SERVICE_ROLE_KEY` as the production alias.

### Meta And WhatsApp Production Setup

Production publishing includes:

- `/legal`
- `/privacy`
- `/terms`
- `/cookies`
- `/data-deletion`
- `/channels`
- `https://luxury-finishing.alazab.com/api/v1/meta/webhook`
- `https://luxury-finishing.alazab.com/api/v1/meta/data-deletion`
- `https://luxury-finishing.alazab.com/api/v1/notifications/system`
- `https://luxury-finishing.alazab.com/api/v1/auth/hooks`
- `https://luxury-finishing.alazab.com/api/v2/whatsapp/hooks`
- `https://luxury-finishing.alazab.com/api/maintenance/gateway`

API route organization is documented in [docs/api-routing.md](./docs/api-routing.md).

### Cloudinary Production Setup

The site builds image delivery URLs dynamically from Cloudinary public IDs under the `luxury-finishing` asset folder.

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

## Quality Gates

```bash
pnpm check
pnpm audit:production
```

`pnpm check` runs type checking, strict linting, unit tests, the production build, and a real smoke test against the built `dist` server.

## Production Deployment

The supported production architecture is:

```text
Nginx :443 -> PM2 -> scripts/serve-dist.mjs -> dist
```

Nginx must not serve `dist` directly with a generic SPA fallback. The PM2 application owns `/healthz`, hidden-file rejection, HTTP method handling, cache policy, and SPA fallback; Nginx owns TLS, the external security-header policy, and exact API reverse proxies.

Run the complete verified Linux release from a clean `main` checkout:

```bash
pnpm deploy:production
```

The application listens internally on:

```text
http://127.0.0.1:3007
```

Verify the externally routed production service:

```bash
pnpm verify:live
```

The repository also contains:

- `.github/workflows/production-readiness.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/production-live-smoke.yml`
- `.github/workflows/deploy-production.yml`
- `deploy/nginx/luxury-finishing.conf`
- `scripts/deploy-pm2.sh`
- `scripts/install-nginx-production.sh`
- `scripts/deploy-production.sh`

The full server prerequisites, GitHub Environment configuration, rollback behavior, and verification contract are documented in [docs/production-deployment.md](./docs/production-deployment.md).

## Chatbot And Maintenance Integration

The chatbot supports:

- general AI assistance
- guided maintenance request creation
- maintenance request status lookup
- optional ElevenLabs live voice sessions for maintenance intake and lookup
- external webhook handling through `chatbot-endpoint`

Integration notes are documented in [docs/chatbot-integration.md](./docs/chatbot-integration.md).
