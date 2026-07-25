import assert from "node:assert/strict";

const productionUrl = new URL(
  process.env.PRODUCTION_URL || "https://luxury-finishing.alazab.com",
);
const timeoutMs = Number(process.env.PRODUCTION_TIMEOUT_MS || "15000");

if (productionUrl.protocol !== "https:") {
  throw new Error("PRODUCTION_URL must use HTTPS.");
}

const baseUrl = productionUrl.origin;
const results = [];
const failures = [];
const observed = {};

const fetchWithTimeout = async (path, options = {}) => {
  const target = new URL(path, baseUrl);
  return fetch(target, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": "Alazab-Luxury-Finishing-Production-Smoke/1.0",
      ...(options.headers || {}),
    },
  });
};

const check = async (name, callback) => {
  try {
    const details = await callback();
    results.push({ check: name, ok: true, details: details || "passed" });
    console.log(`PASS ${name}: ${details || "passed"}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ check: name, ok: false, error: message });
    console.error(`FAIL ${name}: ${message}`);
  }
};

const headerSnapshot = (response) => ({
  server: response.headers.get("server"),
  cacheControl: response.headers.get("cache-control"),
  contentSecurityPolicy: response.headers.get("content-security-policy"),
  permissionsPolicy: response.headers.get("permissions-policy"),
  referrerPolicy: response.headers.get("referrer-policy"),
  strictTransportSecurity: response.headers.get("strict-transport-security"),
  xContentTypeOptions: response.headers.get("x-content-type-options"),
  xFrameOptions: response.headers.get("x-frame-options"),
});

const assertSecurityHeaders = (headers, label) => {
  const violations = [];

  if (headers.xContentTypeOptions !== "nosniff") {
    violations.push(`X-Content-Type-Options=${headers.xContentTypeOptions || "missing"}`);
  }
  if (headers.xFrameOptions !== "DENY") {
    violations.push(`X-Frame-Options=${headers.xFrameOptions || "missing"}`);
  }
  if (headers.referrerPolicy !== "strict-origin-when-cross-origin") {
    violations.push(`Referrer-Policy=${headers.referrerPolicy || "missing"}`);
  }
  if (!/frame-ancestors 'none'/.test(headers.contentSecurityPolicy || "")) {
    violations.push("CSP frame-ancestors 'none' missing");
  }
  if (!/camera=\(\)/.test(headers.permissionsPolicy || "")) {
    violations.push("Permissions-Policy camera=() missing");
  }
  if (!/max-age=\d+/.test(headers.strictTransportSecurity || "")) {
    violations.push("HSTS missing");
  }

  assert.equal(violations.length, 0, `${label}: ${violations.join("; ")}`);
};

let homeResponse;
let homeHtml = "";

await check("HTTPS home response", async () => {
  homeResponse = await fetchWithTimeout("/");
  observed.home = {
    status: homeResponse.status,
    contentType: homeResponse.headers.get("content-type"),
    headers: headerSnapshot(homeResponse),
  };
  homeHtml = await homeResponse.text();
  observed.home.assetEntry =
    homeHtml.match(/src=["'](\/assets\/[^"']+\.js)["']/i)?.[1] || null;
  observed.home.title = homeHtml.match(/<title>([^<]+)<\/title>/i)?.[1] || null;

  assert.equal(homeResponse.status, 200, "home page must return HTTP 200");
  assert.match(
    homeResponse.headers.get("content-type") || "",
    /text\/html/i,
    "home page must return HTML",
  );
  assert.match(homeHtml, /<div id="root"><\/div>/, "response is not the Vite production build");
  assert.match(homeHtml, /Luxury Finishing|تشطيبات فاخرة/i, "site identity is missing");
  return `${homeResponse.status}; ${observed.home.title || "title unavailable"}; ${observed.home.assetEntry || "asset entry unavailable"}`;
});

await check("Home security headers", async () => {
  assert.ok(homeResponse, "home response unavailable");
  assertSecurityHeaders(observed.home.headers, "home");
  return "CSP, HSTS, anti-framing, referrer and permissions headers are enforced";
});

let healthResponse;
let healthBody;

await check("Health endpoint", async () => {
  healthResponse = await fetchWithTimeout("/healthz", {
    headers: { Accept: "application/json" },
  });
  const healthText = await healthResponse.text();
  try {
    healthBody = JSON.parse(healthText);
  } catch {
    healthBody = healthText;
  }
  observed.health = {
    status: healthResponse.status,
    body: healthBody,
    headers: headerSnapshot(healthResponse),
  };

  assert.equal(healthResponse.status, 200, "health endpoint must return HTTP 200");
  assert.deepEqual(healthBody, { ok: true, service: "luxury-finishing" });
  assert.equal(healthResponse.headers.get("cache-control"), "no-store");
  return "healthy and uncached";
});

await check("Health security headers", async () => {
  assert.ok(healthResponse, "health response unavailable");
  assertSecurityHeaders(observed.health.headers, "healthz");
  return "security headers match the application server policy";
});

await check("HEAD handling", async () => {
  const response = await fetchWithTimeout("/", { method: "HEAD" });
  observed.head = { status: response.status, contentLength: response.headers.get("content-length") };
  assert.equal(response.status, 200, "HEAD / must return HTTP 200");
  assert.equal(await response.text(), "", "HEAD / must not return a body");
  return `HTTP ${response.status} without response body`;
});

await check("Method restriction", async () => {
  const response = await fetchWithTimeout("/", { method: "POST" });
  observed.post = { status: response.status, allow: response.headers.get("allow") };
  assert.equal(response.status, 405, "POST / must be rejected");
  assert.equal(response.headers.get("allow"), "GET, HEAD");
  return "POST rejected with HTTP 405 and explicit Allow header";
});

await check("Hidden file protection", async () => {
  const response = await fetchWithTimeout("/.env", { redirect: "manual" });
  observed.hiddenFile = { status: response.status, contentType: response.headers.get("content-type") };
  assert.equal(response.status, 404, "production must not expose or SPA-fallback .env");
  return ".env returns HTTP 404";
});

await check("Source map protection", async () => {
  const response = await fetchWithTimeout("/assets/application.js.map", { redirect: "manual" });
  observed.sourceMap = { status: response.status, contentType: response.headers.get("content-type") };
  assert.equal(response.status, 404, "production must not expose or SPA-fallback source maps");
  return "source map probe returns HTTP 404";
});

await check("SPA fallback", async () => {
  const response = await fetchWithTimeout("/__production_smoke__/spa-route");
  const body = await response.text();
  observed.spaFallback = { status: response.status, contentType: response.headers.get("content-type") };
  assert.equal(response.status, 200, "SPA fallback must return HTTP 200");
  assert.match(body, /<div id="root"><\/div>/, "SPA fallback must return index.html");
  return "unknown application route returns index.html";
});

await check("HTTP to HTTPS redirect", async () => {
  const insecureUrl = new URL(productionUrl);
  insecureUrl.protocol = "http:";
  const response = await fetch(insecureUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "Alazab-Luxury-Finishing-Production-Smoke/1.0" },
  });
  const location = response.headers.get("location") || "";
  observed.httpRedirect = { status: response.status, location };
  assert.ok(
    [301, 302, 307, 308].includes(response.status),
    `HTTP endpoint must redirect to HTTPS; received ${response.status}`,
  );
  assert.ok(location.startsWith("https://"), "HTTP redirect target must use HTTPS");
  return `${response.status} -> ${location}`;
});

const report = {
  ok: failures.length === 0,
  target: baseUrl,
  passed: results,
  failed: failures,
  observed,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
