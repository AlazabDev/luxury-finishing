# Production Deployment

## Production Architecture

```text
GitHub main
  -> pnpm install / typecheck / lint / test / build / audit
  -> PM2: luxury-finishing on 127.0.0.1:3007
  -> Nginx: luxury-finishing.alazab.com on 80/443
  -> exact /api routes forwarded to Supabase Edge Functions
```

Nginx must proxy the application to PM2. Do not serve `dist` directly with a generic `try_files $uri /index.html` rule, because that bypasses the application health endpoint, method policy, hidden-file protection, and runtime security headers.

## One-Time Server Requirements

- Ubuntu with Nginx and systemd.
- Node.js 22 and Corepack.
- PM2 installed for the deployment user.
- A valid Let's Encrypt certificate under:
  - `/etc/letsencrypt/live/luxury-finishing.alazab.com/fullchain.pem`
  - `/etc/letsencrypt/live/luxury-finishing.alazab.com/privkey.pem`
- The deployment user can run the Nginx installation transaction through non-interactive `sudo`.
- The project `.env` exists only on the server and is not committed.

The server checkout must use the repository remote:

```bash
git remote set-url origin https://github.com/AlazabDev/luxury-finishing.git
```

## Direct Server Release

Run as the non-root application deployment user:

```bash
cd /path/to/luxury-finishing
git fetch --prune origin main
git checkout main
git reset --hard origin/main
pnpm deploy:production
```

The command refuses to deploy when:

- the current branch is not `main`;
- the worktree is dirty;
- local `main` differs from `origin/main`;
- Node.js is not version 22;
- typecheck, lint, tests, build, smoke verification, or dependency audit fails;
- the PM2 health endpoint is unavailable;
- the TLS files are missing;
- `nginx -t` fails;
- the externally routed production smoke test fails.

The Nginx transaction stores backups under `/var/backups/luxury-finishing-nginx/` and restores the previous enabled configuration automatically if validation fails.

## GitHub Actions Deployment

The `Deploy Production` workflow requires a protected GitHub Environment named `production` and the following configuration:

### Environment secrets

- `PRODUCTION_HOST`
- `PRODUCTION_USER`
- `PRODUCTION_SSH_PRIVATE_KEY`
- `PRODUCTION_SSH_KNOWN_HOSTS`
- `PRODUCTION_SSH_PORT` — optional; defaults to `22`

### Environment variable

- `PRODUCTION_APP_PATH` — absolute path of the server checkout

The workflow checks out `main`, connects with strict known-host verification, resets the server checkout to the exact GitHub workflow SHA, runs the transactional release, and repeats the live verification from a GitHub-hosted runner.

## Verification Commands

Local application server:

```bash
curl -i http://127.0.0.1:3007/healthz
```

Public production:

```bash
pnpm verify:live
```

Expected health body:

```json
{"ok":true,"service":"luxury-finishing"}
```

The live check also verifies:

- DNS and HTTPS availability;
- security headers including CSP, HSTS, anti-framing, and Permissions-Policy;
- correct `HEAD` handling;
- rejection of unsupported HTTP methods;
- HTTP-to-HTTPS redirect;
- `.env` and source-map protection;
- SPA fallback.

## Current Failure Signatures

These results indicate that an old direct-static Nginx configuration is still active:

- `/healthz` returns `index.html` instead of JSON;
- `/.env` returns HTTP 200 through SPA fallback;
- `X-Frame-Options` is `SAMEORIGIN` instead of `DENY`;
- CSP or Permissions-Policy is missing;
- the JavaScript asset hash differs from the latest successful CI artifact.

Apply `deploy/nginx/luxury-finishing.conf` through `pnpm deploy:production`; do not patch individual headers while leaving the old static-server architecture active.
