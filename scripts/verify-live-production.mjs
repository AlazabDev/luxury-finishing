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

const record = (check, details) => {
  results.push({ check, ok: true, details });
  console.log(`PASS ${check}: ${details}`);
};

const fetchWithTimeout = async (path, options = {}) => {
  const target = new URL(path, baseUrl);
  const response = await fetch(target, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": "Alazab-Luxury-Finishing-Production-Smoke/1.0",
      ...(options.headers || {}),
    },
  });
  return response;
};

const assertSecurityHeaders = (response, label) => {
  assert.equal(
    response.headers.get("x-content-type-options"),
    "nosniff",
    `${label}: missing X-Content-Type-Options`,
  );
  assert.equal(
    response.headers.get("x-frame-options"),
    "DENY",
    `${label}: missing X-Frame-Options`,
  );
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
    `${label}: missing Referrer-Policy`,
  );
  assert.match(
    response.headers.get("content-security-policy") || "",
    /frame-ancestors 'none'/,
    `${label}: CSP must prevent framing`,
  );
  assert.match(
    response.headers.get("permissions-policy") || "",
    /camera=\(\)/,
    `${label}: Permissions-Policy must disable camera`,
  );
  assert.match(
    response.headers.get("strict-transport-security") || "",
    /max-age=\d+/,
    `${label}: missing HSTS`,
  );
};

try {
  const homeResponse = await fetchWithTimeout("/");
  assert.equal(homeResponse.status, 200, "Home page must return HTTP 200");
  assert.match(
    homeResponse.headers.get("content-type") || "",
    /text\/html/i,
    "Home page must return HTML",
  );
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, /<div id="root"><\/div>/, "Home page is not the Vite production build");
  assert.match(homeHtml, /Luxury Finishing|تشطيبات فاخرة/i, "Home page identity is missing");
  assertSecurityHeaders(homeResponse, "home");
  record("HTTPS home", `${homeResponse.status} ${homeResponse.headers.get("content-type")}`);

  const healthResponse = await fetchWithTimeout("/healthz", {
    headers: { Accept: "application/json" },
  });
  assert.equal(healthResponse.status, 200, "Health endpoint must return HTTP 200");
  assert.deepEqual(await healthResponse.json(), {
    ok: true,
    service: "luxury-finishing",
  });
  assert.equal(healthResponse.headers.get("cache-control"), "no-store");
  assertSecurityHeaders(healthResponse, "healthz");
  record("Health endpoint", "healthy and uncached");

  const headResponse = await fetchWithTimeout("/", { method: "HEAD" });
  assert.equal(headResponse.status, 200, "HEAD / must return HTTP 200");
  assert.equal(await headResponse.text(), "", "HEAD / must not return a body");
  record("HEAD handling", "HTTP 200 without response body");

  const methodResponse = await fetchWithTimeout("/", { method: "POST" });
  assert.equal(methodResponse.status, 405, "POST / must be rejected");
  assert.equal(methodResponse.headers.get("allow"), "GET, HEAD");
  record("Method restriction", "POST rejected with HTTP 405");

  const hiddenFileResponse = await fetchWithTimeout("/.env", { redirect: "manual" });
  assert.equal(hiddenFileResponse.status, 404, "Production must not expose .env");
  record("Hidden file protection", ".env returns HTTP 404");

  const sourceMapResponse = await fetchWithTimeout("/assets/application.js.map", {
    redirect: "manual",
  });
  assert.equal(sourceMapResponse.status, 404, "Production must not expose source maps");
  record("Source map protection", "source map probe returns HTTP 404");

  const spaResponse = await fetchWithTimeout("/__production_smoke__/spa-route");
  assert.equal(spaResponse.status, 200, "SPA fallback must return HTTP 200");
  assert.match(await spaResponse.text(), /<div id="root"><\/div>/);
  record("SPA fallback", "unknown application route returns index.html");

  const insecureUrl = new URL(productionUrl);
  insecureUrl.protocol = "http:";
  const redirectResponse = await fetch(insecureUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "Alazab-Luxury-Finishing-Production-Smoke/1.0" },
  });
  assert.ok(
    [301, 302, 307, 308].includes(redirectResponse.status),
    `HTTP endpoint must redirect to HTTPS; received ${redirectResponse.status}`,
  );
  const location = redirectResponse.headers.get("location") || "";
  assert.ok(location.startsWith("https://"), "HTTP redirect target must use HTTPS");
  record("HTTP to HTTPS", `${redirectResponse.status} -> ${location}`);

  console.log(JSON.stringify({ ok: true, target: baseUrl, results }, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        target: baseUrl,
        completed: results,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
