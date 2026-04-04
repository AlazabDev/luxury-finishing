############
# Secrets
#
# YOU MUST CHANGE ALL THE DEFAULT VALUES BELOW BEFORE STARTING
# THE CONTAINERS FOR THE FIRST TIME!
#
# Documentation:
# https://supabase.com/docs/guides/self-hosting/docker#configuring-and-securing-supabase
#
# To generate secrets and API keys:
# sh ./utils/generate-keys.sh
#
############

# Postgres
POSTGRES_PASSWORD=your-password

# Legacy symmetric HS256 key
JWT_SECRET=your-secret
# Legacy API keys (HS256-signed JWTs)
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key

# Asymmetric key pair (ES256) and opaque API keys
#
# Documentation:
# https://supabase.com/docs/guides/self-hosting/self-hosted-auth-keys
#
# To generate:
# sh ./utils/add-new-auth-keys.sh
#
# Opaque API key for client-side use (anon role).
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# Opaque API key for server-side use (service_role). Never expose in client code.
SUPABASE_SECRET_KEY=your-supabase-secret-key
# JSON array of signing JWKs (EC private + legacy symmetric).
# Used by Auth.
JWT_KEYS=your-jwt-config
# JWKS for token verification (EC public + legacy symmetric).
# Used by PostgREST, Realtime, Storage to verify tokens.
JWT_JWKS=your-jwt-config

# Access to Dashboard
DASHBOARD_USERNAME=your-username
DASHBOARD_PASSWORD=your-password

# Used by Realtime and Supavisor
SECRET_KEY_BASE=your-secret-key-base

# Used by Supavisor
VAULT_ENC_KEY=your-vault-enc-key

# Used by Studio to access Postgres via postgres-meta
PG_META_CRYPTO_KEY=your-pg-meta-crypto-key

# Analytics - API tokens for log ingestion/querying, and for management
LOGFLARE_PUBLIC_ACCESS_TOKEN=your-token
LOGFLARE_PRIVATE_ACCESS_TOKEN=your-token

# Access to Storage via S3 protocol endpoint (see below)
S3_PROTOCOL_ACCESS_KEY_ID=your-id
S3_PROTOCOL_ACCESS_KEY_SECRET=your-secret


############
# URLs - Configure hostnames below to reflect your actual domain name
############

# Access to Dashboard and REST API
SUPABASE_PUBLIC_URL=https://supabase.alazab.com

# Full external URL of the Auth service, used to construct OAuth callbacks,
# SAML endpoints, and email links
API_EXTERNAL_URL=https://supabase.alazab.com

# See also the Auth section below for Site URL and Redirect URLs configuration


############
# Database - Postgres configuration
############

# Using default user (postgres)
POSTGRES_HOST=db
POSTGRES_DB=postgres

# Default configuration includes Supavisor exposing POSTGRES_PORT
# Postgres uses POSTGRES_PORT inside the container
# Documentation:
# https://supabase.com/docs/guides/self-hosting/docker#accessing-postgres-through-supavisor
POSTGRES_PORT=5432


############
# Supavisor - Database pooler
############

# Supavisor exposes POSTGRES_PORT and POOLER_PROXY_PORT_TRANSACTION,
# POSTGRES_PORT is used for session mode pooling
#
# Port to use for transaction mode pooling connections
POOLER_PROXY_PORT_TRANSACTION=6543

# Maximum number of PostgreSQL connections Supavisor opens per pool
POOLER_DEFAULT_POOL_SIZE=20

# Maximum number of client connections Supavisor accepts per pool
POOLER_MAX_CLIENT_CONN=100

# Unique Supavisor tenant identifier
# Documentation:
# https://supabase.com/docs/guides/self-hosting/docker#accessing-postgres
POOLER_TENANT_ID=alazab-group

# Pool size for internal metadata storage used by Supavisor
# This is separate from client connections and used only by Supavisor itself
POOLER_DB_POOL_SIZE=5


############
# Studio - Configuration for the Dashboard
############

STUDIO_DEFAULT_ORGANIZATION=Alazab
STUDIO_DEFAULT_PROJECT=alazab-system-hub

# Add your OpenAI API key to enable AI Assistant
OPENAI_API_KEY=your-api-key


############
# Auth - Configuration for the authentication server
############

## General settings
# Equivalent to "Site URL" and "Redirect URLs" platform configuration options
# Documentation: https://supabase.com/docs/guides/auth/redirect-urls
SITE_URL=https://supabase.alazab.com
ADDITIONAL_REDIRECT_URLS=https://supabase.alazab.com/auth/v1/callback

JWT_EXPIRY=3600
DISABLE_SIGNUP=false

## Mailer Config
MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
MAILER_URLPATHS_INVITE=/auth/v1/verify
MAILER_URLPATHS_RECOVERY=/auth/v1/verify
MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify

## Email auth
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
SMTP_ADMIN_EMAIL=admin@it.al-azab.co
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-pass
SMTP_SENDER_NAME='Alazab Support'
ENABLE_ANONYMOUS_USERS=true

## Phone auth
ENABLE_PHONE_SIGNUP=true
ENABLE_PHONE_AUTOCONFIRM=true

## OAuth / Social login providers

# Uncomment and fill in the providers you want to enable.
# You must ALSO uncomment the matching GOTRUE_EXTERNAL_* lines in docker-compose.yml.
# Documentation: https://supabase.com/docs/guides/self-hosting/self-hosted-oauth
GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_SECRET=your-secret

GITHUB_ENABLED=true
GITHUB_CLIENT_ID=your-client-id
GITHUB_SECRET=your-secret

AZURE_ENABLED=true
AZURE_CLIENT_ID=your-client-id
AZURE_SECRET=your-secret

# Phone / SMS provider configuration
# Uncomment to configure SMS delivery for phone auth and phone MFA.
# You must ALSO uncomment the matching GOTRUE_SMS_* lines in docker-compose.yml.
# Documentation: https://supabase.com/docs/guides/self-hosting/self-hosted-phone-mfa
SMS_PROVIDER=twilio
SMS_OTP_EXP=300
SMS_OTP_LENGTH=6
SMS_MAX_FREQUENCY=60s
SMS_TEMPLATE=Your code is {{ .Code }}

SMS_TWILIO_ACCOUNT_SID=your-account-sid
SMS_TWILIO_AUTH_TOKEN=your-token
SMS_TWILIO_MESSAGE_SERVICE_SID=your-message-service-sid

TWILIO_API_KEY=your-api-key
TWILIO_API_SECRET=your-secret

# Test OTP: map phone numbers to fixed OTP codes for development
# Format: phone1:code1,phone2:code2
SMS_TEST_OTP=01004006620:123456,01092750351:654321

# Multi-factor authentication (MFA)
# Uncomment to change MFA defaults.
# You must ALSO uncomment the matching GOTRUE_MFA_* lines in docker-compose.yml.

# App Authenticator (TOTP) - enabled by default
MFA_TOTP_ENROLL_ENABLED=true
MFA_TOTP_VERIFY_ENABLED=true

# Phone MFA - disabled by default (opt-in)
MFA_PHONE_ENROLL_ENABLED=true
MFA_PHONE_VERIFY_ENABLED=true

## Maximum MFA factors a user can enroll
MFA_MAX_ENROLLED_FACTORS=10


############
# Storage - Configuration for Storage
############

# Check the S3_PROTOCOL_ACCESS_KEY_ID/SECRET above, and
# refer to the documentation at:
# https://supabase.com/docs/guides/self-hosting/self-hosted-s3
# to learn how to configure the S3 protocol endpoint

# S3 bucket when using S3 backend, directory name when using 'file'
GLOBAL_S3_BUCKET=supabase

# Used for S3 protocol endpoint configuration
REGION=us-east-1

# Used by MinIO when added via:
# docker compose -f docker-compose.yml -f docker-compose.s3.yml up -d

# Equivalent to project_ref as described here:
# https://supabase.com/docs/guides/storage/s3/authentication#session-token
STORAGE_TENANT_ID=alazab-production


# ============================================
# AWS S3 Configuration - us-east-1
# ============================================

AWS_REGION=us-east-1
AWS_S3_ENDPOINT=http://minio:9000
AWS_S3_BUCKET=supabase-547490366561

# إذا كان لديك مفاتيح AWS
AWS_ACCESS_KEY_ID=your-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# ============================================
# Google Cloud Storage - تم التفعيل بنجاح ✅
# ============================================
GCP_ALIAS=gcp-global
GCP_PROJECT_ID=your-id
GCP_HMAC_ACCESS_ID=your-id
GCP_HMAC_SECRET=your-secret

# Buckets
GCP_ARCHIVE_BUCKET=alazab-487922-archive
GCP_BACKUP_BUCKET=alazab-487922-backup
GCP_MEDIA_BUCKET=alazab-487922-media
GCP_PROJECTS_BUCKET=alazab-487922-projects
GCP_PUBLIC_BUCKET=alazab-487922-public
GCP_TEST_BUCKET=alazab-487922-test

# ============================================
# Oracle Cloud Infrastructure (OCI) - جدة
# ============================================

# OCI Credentials
OCI_ALIAS=oci
OCI_REGION=me-jeddah-1
OCI_ENDPOINT=
OCI_ACCESS_KEY=
OCI_SECRET_KEY=your-oci-secret-key
OCI_API_VERSION=S3v4

# OCI Buckets
OCI_MEDIA_BUCKET=alazab-media
OCI_MEDIA_GALLERY_BUCKET=alazab-media-gallery

# استخدامات OCI
OCI_STORAGE_FOR_MENA=true
OCI_CDN_ENABLED=true

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=azabstoragehub
AZURE_STORAGE_ACCOUNT_KEY=your-account-key
AZURE_STORAGE_CONTAINER=alazab-media
AZURE_STORAGE_ENDPOINT=https://azabstoragehub.blob.core.windows.net

############
# Functions - Configuration for Edge functions
############

# Documentation:
# https://supabase.com/docs/guides/self-hosting/self-hosted-functions

# NOTE: VERIFY_JWT applies to all functions
FUNCTIONS_VERIFY_JWT=true

DENO_API_KEY=your-api-key
DENO_VOLUMES_ID=vol_ord_5rbrcw1ftv98a0va8rrk
DENO_AZAB_KEY=ddp_bD1Kpr5QXa21FdyPs4B93KT1CK0vLXgsnq9j

############
# API - Configuration for PostgREST
############

# Postgres schemas exposed via the REST API
PGRST_DB_SCHEMAS=public,storage,graphql_public


############
# Analytics - Configuration for Logflare
############

# Check the LOGFLARE_* access token configuration above.
# If Logflare is externally exposed, configure securely!

# Docker socket location - this value will differ depending on your OS
DOCKER_SOCKET_LOCATION=/var/run/docker.sock

# Google Cloud Project details
GOOGLE_PROJECT_ID=your-id
GOOGLE_PROJECT_NUMBER=93032397237

############
# API Proxy - Configuration for the Kong API gateway
############

KONG_HTTP_PORT=8800
KONG_HTTPS_PORT=8443

############
# imgproxy
############

# Enable webp support
IMGPROXY_ENABLE_WEBP_DETECTION=true
IMGPROXY_AUTO_WEBP=true


############
# TLS Proxy - Optional Caddy or Nginx reverse proxy with Let's Encrypt
############

# Documentation:
# https://supabase.com/docs/guides/self-hosting/self-hosted-proxy-https

# Usage:
# docker compose -f docker-compose.yml -f docker-compose.caddy.yml up -d
# docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d

# Domain name for the proxy (must point to your server)
PROXY_DOMAIN=supabase.alazab.com

# Email for Let's Encrypt certificate notifications (nginx only, Caddy uses PROXY_DOMAIN).
# This should be a valid email, not a placehoder (otherwise Certbot may fail to start).
CERTBOT_EMAIL=admin@alazab.com

# ========== PARALLEL RUN CONFIG ==========

# لمنع إرسال إيميلات أو SMS من السيرفر المحلي أثناء الاختبار
DISABLE_EMAIL_NOTIFICATIONS=true
DISABLE_SMS_NOTIFICATIONS=true
DISABLE_WHATSAPP_NOTIFICATIONS=true

# لمنع إرسال Webhooks للخدمات الخارجية
WEBHOOKS_DISABLED=true

# للتحكم في أي بيانات تزامن (Sync) مع السحابة
SYNC_WITH_CLOUD_ENABLED=true
SYNC_WITH_CLOUD_URL=https://zrrffsjbfkphridqyais.supabase.co
SYNC_WITH_CLOUD_ANON_KEY=your-anon-key
SYNC_WITH_CLOUD_SERVICE_KEY=your-sync-with-cloud-service-key

# لو عاوز تسمح بالدخول بنفس كلمة مرور السحابة
ALLOW_CLOUD_CREDENTIALS=true

# منع التخزين المؤقت للملفات (عشان ما تتصرف مع MinIO المحلي)
STORAGE_CACHE_DISABLED=true

# وضع الـ logs للتتبع
LOG_LEVEL=debug
LOG_PAYLOADS=true

# ============================================
# OAuth Configuration - Production Ready
# ============================================

# Enable OAuth redirect proxy (keep false unless debugging)
OAUTH_REDIRECT_PROXY_ENABLED=false

# Main OAuth callback URL (must match exactly with provider configuration)
OAUTH_REDIRECT_PROXY_URL=https://supabase.alazab.com/auth/v1/callback

# ============================================
# WhatsApp Business Integration
# ============================================

# Meta Business Account
META_BUSINESS_ID=your-id
META_ACCESS_TOKEN=your-token  # سيتم تدويره قبل الإنتاج
META_VERIFY_TOKEN=your-token  # غيّره لشيء عشوائي

# WhatsApp Business Account الرئيسي (alazab - 30 قالب)
WABA_ID=your-id
WABA_NAMESPACE=your-namespace

# WhatsApp Business Account الاحتياطي (لديه 20 قالب)
WABA_BACKUP_ID=your-id
WABA_BACKUP_NAMESPACE=your-namespace

# WhatsApp Webhook
WHATSAPP_WEBHOOK_URL=https://supabase.alazab.com/webhook/whatsapp
WHATSAPP_WEBHOOK_SECRET=your-secret  # مؤقت

# ============================================
# OpenAI Integration
# ============================================

# OpenAI API (للتحليل)
# OpenAI organization id is optional; leave blank if unused.
OPENAI_ORG_ID=your-id

# OpenAI Vision (لتحليل الصور)
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_MAX_TOKENS=1000

# ============================================
# DeepSeek Integration (لتنظيم البيانات)
# ============================================

DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.3

# ============================================
# قوالب واتساب الجاهزة
# ============================================

# قوالب مشروع alazab (الأكبر)
WHATSAPP_TEMPLATE_WELCOME=1361626022352015
WHATSAPP_TEMPLATE_PROJECT_START=1302705165017135
WHATSAPP_TEMPLATE_DAILY_UPDATE=1267718818594610
WHATSAPP_TEMPLATE_MATERIAL_ARRIVAL=847495374990380
WHATSAPP_TEMPLATE_QUALITY_REPORT=4282775242010041
WHATSAPP_TEMPLATE_COMPLETION=2178649532542954
WHATSAPP_TEMPLATE_INVOICE=1331187732388421
WHATSAPP_TEMPLATE_REMINDER=2167682460644292
WHATSAPP_TEMPLATE_THANK_YOU=872505905758421

# قوالب عربية
WHATSAPP_TEMPLATE_AR_WELCOME=648503888315834
WHATSAPP_TEMPLATE_AR_UPDATE=1951684145783893
WHATSAPP_TEMPLATE_AR_COMPLETION=25769912275991897

# ============================================
# إعدادات المشروع والتخزين
# ============================================

# Project settings
PROJECT_NAME='Alazab Construction'
PROJECT_TIMEZONE=Africa/Cairo
PROJECT_LANGUAGES=ar,en

# Storage paths
STORAGE_WHATSAPP_IMAGES=whatsapp-uploads/
STORAGE_ANALYZED_IMAGES=analyzed-images/
STORAGE_REPORTS=project-reports/
STORAGE_ARCHIVE=archive/

# ============================================
# AI Analysis Settings
# ============================================

AI_ANALYSIS_ENABLED=true
AI_ANALYSIS_MIN_CONFIDENCE=0.7
AI_ANALYSIS_SAVE_RAW=true
AI_ANALYSIS_SAVE_ENHANCED=true

# Auto-report settings
AUTO_REPORT_DAILY=true
AUTO_REPORT_WEEKLY=true
AUTO_REPORT_MONTHLY=true
AUTO_REPORT_TIME=17:00

# Notification settings
NOTIFY_CLIENT_ON_PROGRESS=true
NOTIFY_CLIENT_ON_MATERIALS=true
NOTIFY_CLIENT_ON_COMPLETION=true
NOTIFY_TEAM_ON_NEW_IMAGES=true


# ENV Supabase-Alazab
SA_POSTGRES_DATABASE="postgres"
SA_POSTGRES_HOST="db.zrrffsjbfkphridqyais.supabase.co"
SA_POSTGRES_PASSWORD="your-password"
SA_SPOSTGRES_PRISMA_URL="postgres://postgres.zrrffsjbfkphridqyais:azab202555db@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
SA_POSTGRES_URL="postgresql://your-user:your-password@your-host:5432/your-database"
SA_POSTGRES_URL_NON_POOLING="postgresql://your-user:your-password@your-host:5432/your-database"
SA_POSTGRES_USER="your-postgres-user"
SA_SUPABASE_ANON_KEY="your-anon-key"
SA_SUPABASE_JWT_SECRET="your-secret"
SA_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SA_SUPABASE_SECRET_KEY="your-sa-supabase-secret-key"
SA_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SA_SUPABASE_URL="https://zrrffsjbfkphridqyais.supabase.co"

# ENV Supabase-Orange-Chair
SOC_POSTGRES_DATABASE="postgres"
SOC_POSTGRES_HOST="db.bxuhcbfdoaflsgbxiqei.supabase.co"
SOC_POSTGRES_PASSWORD="your-password"
SOC_SPOSTGRES_PRISMA_URL="postgres://postgres.bxuhcbfdoaflsgbxiqei:azab202555db@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
SOC_POSTGRES_URL="postgresql://your-user:your-password@your-host:5432/your-database"
SOC_POSTGRES_URL_NON_POOLING="postgresql://your-user:your-password@your-host:5432/your-database"
SOC_POSTGRES_USER="your-postgres-user"
SOC_SUPABASE_ANON_KEY="your-anon-key"
SOC_SUPABASE_JWT_SECRET="your-secret"
SOC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SOC_SUPABASE_SECRET_KEY="your-soc-supabase-secret-key"
SOC_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SOC_SUPABASE_URL="https://bxuhcbfdoaflsgbxiqei.supabase.co"

# ============================================
# Supabase Storage Configuration
# ============================================

# Storage backend selection
# Options: file (local), s3 (AWS/OCI/GCP), gcs (Google Cloud Storage)
STORAGE_BACKEND=file

# Local file storage path
FILE_STORAGE_BACKEND_PATH=/var/lib/storage

# S3 configuration (used when STORAGE_BACKEND=s3)
GLOBAL_S3_ENDPOINT=http://minio:9000
GLOBAL_S3_PROTOCOL=http
GLOBAL_S3_FORCE_PATH_STYLE=true

# Enable image transformation
ENABLE_IMAGE_TRANSFORMATION=true
IMGPROXY_URL=http://imgproxy:5001

# File size limit (50MB)
FILE_SIZE_LIMIT=52428800

# Tenant ID for storage
STORAGE_TENANT_ID=alazab-production

# MinIO Configuration
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=your-password
MINIO_ENDPOINT=http://minio:9000
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9101

# ============================================
# Auth Hooks / SAML / Sync defaults
# ============================================
SAML_ENABLED=false
SAML_PRIVATE_KEY=
SAML_ALLOW_ENCRYPTED_ASSERTIONS=false
SAML_RELAY_STATE_VALIDITY_PERIOD=300s
SAML_EXTERNAL_URL=
SAML_RATE_LIMIT_ASSERTION=10

GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_SECRETS=your-secret
GOTRUE_HOOK_SEND_SMS_SECRETS=your-secret
GOTRUE_HOOK_SEND_EMAIL_SECRETS=your-secret

SYNC_INTERVAL=300
SYNC_DIRECTION=bidirectional
SYNC_CONFLICT_STRATEGY=last-write-wins
PGRST_DB_MAX_ROWS=1000
PGRST_DB_EXTRA_SEARCH_PATH=public
ANON_KEY_ASYMMETRIC=your-anon-key-asymmetric
SERVICE_ROLE_KEY_ASYMMETRIC=your-service-role-key-asymmetric
