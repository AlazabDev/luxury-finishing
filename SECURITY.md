# Security Policy

## Supported Version

Security fixes are applied to the latest code on the `main` branch.

## Reporting a Vulnerability

Do not open a public issue containing exploit details, credentials, access tokens, personal data, or production infrastructure information.

Report security concerns privately to:

- `lf@alazab.com`

Include the affected component, reproduction steps, observed impact, and any relevant request identifiers. Do not include live secrets in screenshots or attachments.

## Repository Secret Policy

- Runtime secrets must be stored in the deployment secret manager or Supabase function secrets.
- `.env` files must remain untracked.
- Only variables prefixed with `VITE_` may be exposed to browser bundles, and they must contain public configuration only.
- Service-role keys, API keys, mailbox passwords, webhook secrets, and access tokens must never be added to frontend source code or committed files.

## Production Baseline

Pull requests targeting `main` must pass type checking, linting, unit tests, production build, runtime smoke verification, and production dependency auditing before deployment.
