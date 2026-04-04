import { createReadStream, existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || "3007");
const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
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
  ".map": "public, max-age=31536000, immutable",
  ".png": "public, max-age=31536000, immutable",
  ".svg": "public, max-age=31536000, immutable",
  ".webp": "public, max-age=31536000, immutable",
  ".woff": "public, max-age=31536000, immutable",
  ".woff2": "public, max-age=31536000, immutable",
};

const ensureDistExists = async () => {
  if (!existsSync(indexPath)) {
    throw new Error("dist/index.html not found. Run `pnpm build` before starting PM2.");
  }
};

const safeFilePathFromUrl = (requestUrl) => {
  const parsedUrl = new URL(requestUrl, `http://${host}:${port}`);
  const decodedPath = decodeURIComponent(parsedUrl.pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(distDir, normalizedPath);
};

const sendFile = async (res, filePath) => {
  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const cacheControl = cacheControlByExtension[extension] || "public, max-age=300";
  const stats = await fs.stat(filePath);

  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  });

  createReadStream(filePath).pipe(res);
};

const sendIndex = async (res) => {
  const stats = await fs.stat(indexPath);
  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(indexPath).pipe(res);
};

const server = createServer(async (req, res) => {
  try {
    const method = req.method || "GET";

    if (method !== "GET" && method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    const filePath = safeFilePathFromUrl(req.url || "/");

    if (existsSync(filePath)) {
      await sendFile(res, filePath);
      return;
    }

    await sendIndex(res);
  } catch (error) {
    console.error("serve-dist error:", error);
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, error: "Internal server error" }));
  }
});

await ensureDistExists();

server.listen(port, host, () => {
  console.log(`Luxury Finishing server running at http://${host}:${port}`);
});
