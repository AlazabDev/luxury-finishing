import { createReadStream, existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || "3007");
const distDir = resolve(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const cacheControlByExtension = {
  ".css": "public, max-age=31536000, immutable",
  ".gif": "public, max-age=31536000, immutable",
  ".ico": "public, max-age=604800",
  ".jpg": "public, max-age=31536000, immutable",
  ".jpeg": "public, max-age=31536000, immutable",
  ".js": "public, max-age=31536000, immutable",
  ".png": "public, max-age=31536000, immutable",
  ".svg": "public, max-age=31536000, immutable",
  ".webp": "public, max-age=31536000, immutable",
  ".woff": "public, max-age=31536000, immutable",
  ".woff2": "public, max-age=31536000, immutable",
};

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://al-azab.co",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.elevenlabs.io https://*.elevenlabs.io wss://*.elevenlabs.io",
  "frame-src 'self' https://*.elevenlabs.io",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
};

const ensureDistExists = async () => {
  if (!existsSync(indexPath)) {
    throw new Error("dist/index.html not found. Run `pnpm build` before starting PM2.");
  }
};

const isHiddenOrSourceMapPath = (pathname) => {
  const segments = pathname.split(/[\\/]/).filter(Boolean);
  return segments.some((segment) => segment.startsWith(".")) || pathname.endsWith(".map");
};

const safeFilePathFromUrl = (requestUrl) => {
  const parsedUrl = new URL(requestUrl, "http://localhost");
  const decodedPath = decodeURIComponent(parsedUrl.pathname);

  if (decodedPath.includes("\0") || isHiddenOrSourceMapPath(decodedPath)) {
    return null;
  }

  const candidate = resolve(distDir, `.${decodedPath}`);
  const relativePath = relative(distDir, candidate);
  const escapesDist =
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath);

  return escapesDist ? null : candidate;
};

const writeResponseHead = (res, statusCode, headers = {}) => {
  res.writeHead(statusCode, {
    ...securityHeaders,
    ...headers,
  });
};

const sendJson = (res, statusCode, payload, method = "GET") => {
  const body = JSON.stringify(payload);
  writeResponseHead(res, statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json; charset=utf-8",
  });
  if (method === "HEAD") return res.end();
  res.end(body);
};

const sendFile = async (res, filePath, method) => {
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const cacheControl = cacheControlByExtension[extension] || "public, max-age=300";
  const stats = await fs.stat(filePath);

  if (!stats.isFile()) return false;

  writeResponseHead(res, 200, {
    "Cache-Control": cacheControl,
    "Content-Length": stats.size,
    "Content-Type": contentType,
  });

  if (method === "HEAD") {
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
};

const sendIndex = async (res, method) => {
  const stats = await fs.stat(indexPath);
  writeResponseHead(res, 200, {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Content-Length": stats.size,
    "Content-Type": "text/html; charset=utf-8",
  });

  if (method === "HEAD") return res.end();
  createReadStream(indexPath).pipe(res);
};

const server = createServer(async (req, res) => {
  const method = req.method || "GET";

  try {
    if (method !== "GET" && method !== "HEAD") {
      writeResponseHead(res, 405, {
        Allow: "GET, HEAD",
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    const parsedUrl = new URL(req.url || "/", "http://localhost");
    if (parsedUrl.pathname === "/healthz") {
      sendJson(res, 200, { ok: true, service: "luxury-finishing" }, method);
      return;
    }

    let filePath;
    try {
      filePath = safeFilePathFromUrl(req.url || "/");
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid URL" }, method);
      return;
    }

    if (!filePath) {
      sendJson(res, 404, { ok: false, error: "Not found" }, method);
      return;
    }

    if (existsSync(filePath) && (await sendFile(res, filePath, method))) {
      return;
    }

    await sendIndex(res, method);
  } catch (error) {
    console.error("serve-dist error:", error instanceof Error ? error.message : error);
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: "Internal server error" }, method);
    } else {
      res.destroy();
    }
  }
});

await ensureDistExists();

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;

server.listen(port, host, () => {
  console.log(`Luxury Finishing server running at http://${host}:${port}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received; closing Luxury Finishing server.`);
  server.close((error) => {
    if (error) {
      console.error("Server shutdown failed:", error);
      process.exitCode = 1;
    }
  });

  setTimeout(() => process.exit(1), 10_000).unref();
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
