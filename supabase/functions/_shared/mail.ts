const parsePort = (name: string, fallback: number) => {
  const rawValue = Deno.env.get(name)?.trim();
  if (!rawValue) return fallback;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a valid port number`);
  }

  return parsed;
};

const parseBoolean = (name: string, fallback: boolean) => {
  const rawValue = Deno.env.get(name)?.trim().toLowerCase();
  if (!rawValue) return fallback;
  return rawValue === "true" || rawValue === "1" || rawValue === "yes";
};

const getRequiredEnv = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

export interface MailTransportConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export interface ProjectMailConfig {
  provider: string;
  primaryEmail: string;
  primaryName: string;
  replyTo: string;
  webmailUrl?: string;
  smtp: MailTransportConfig;
  imap: MailTransportConfig;
  smtpStartTlsPort?: number;
  sieve?: {
    host: string;
    port: number;
    security: string;
    username: string;
    password: string;
  };
}

export const getProjectMailConfig = (): ProjectMailConfig => {
  const primaryEmail = getRequiredEnv("PROJECT_PRIMARY_EMAIL");

  return {
    provider: Deno.env.get("MAIL_PROVIDER")?.trim() || "migadu",
    primaryEmail,
    primaryName: Deno.env.get("PROJECT_PRIMARY_EMAIL_NAME")?.trim() || "Luxury Finishing",
    replyTo: Deno.env.get("MAIL_REPLY_TO")?.trim() || primaryEmail,
    webmailUrl: Deno.env.get("MAIL_WEBMAIL_URL")?.trim() || undefined,
    smtp: {
      host: getRequiredEnv("MAIL_SMTP_HOST"),
      port: parsePort("MAIL_SMTP_PORT", 465),
      secure: parseBoolean("MAIL_SMTP_SECURE", true),
      username: getRequiredEnv("MAIL_SMTP_USER"),
      password: getRequiredEnv("MAIL_SMTP_PASSWORD"),
    },
    imap: {
      host: getRequiredEnv("MAIL_IMAP_HOST"),
      port: parsePort("MAIL_IMAP_PORT", 993),
      secure: parseBoolean("MAIL_IMAP_SECURE", true),
      username: getRequiredEnv("MAIL_IMAP_USER"),
      password: getRequiredEnv("MAIL_IMAP_PASSWORD"),
    },
    smtpStartTlsPort: Deno.env.get("MAIL_SMTP_STARTTLS_PORT")
      ? parsePort("MAIL_SMTP_STARTTLS_PORT", 587)
      : undefined,
    sieve: Deno.env.get("MAIL_SIEVE_HOST")?.trim()
      ? {
          host: getRequiredEnv("MAIL_SIEVE_HOST"),
          port: parsePort("MAIL_SIEVE_PORT", 4190),
          security: Deno.env.get("MAIL_SIEVE_SECURITY")?.trim() || "starttls",
          username: getRequiredEnv("MAIL_SIEVE_USER"),
          password: getRequiredEnv("MAIL_SIEVE_PASSWORD"),
        }
      : undefined,
  };
};
