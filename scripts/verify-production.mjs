import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 43117;
const baseUrl = `http://127.0.0.1:${port}`;
let logs = "";

const server = spawn(process.execPath, ["./scripts/serve-dist.mjs"], {
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    NODE_ENV: "production",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited before becoming ready.\n${logs}`);
    }

    try {
      const response = await fetch(`${baseUrl}/healthz`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Production server did not become ready.\n${logs}`);
};

const assertSecurityHeaders = (response) => {
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);
  assert.match(response.headers.get("permissions-policy") || "", /camera=\(\)/);
};

const stopServer = async () => {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
};

try {
  await waitForServer();

  const healthResponse = await fetch(`${baseUrl}/healthz`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), {
    ok: true,
    service: "luxury-finishing",
  });
  assert.equal(healthResponse.headers.get("cache-control"), "no-store");
  assertSecurityHeaders(healthResponse);

  const homeResponse = await fetch(`${baseUrl}/`);
  assert.equal(homeResponse.status, 200);
  assert.match(homeResponse.headers.get("content-type") || "", /text\/html/);
  assert.match(await homeResponse.text(), /<div id="root"><\/div>/);
  assertSecurityHeaders(homeResponse);

  const spaResponse = await fetch(`${baseUrl}/projects/example-project`);
  assert.equal(spaResponse.status, 200);
  assert.match(await spaResponse.text(), /<div id="root"><\/div>/);

  const headResponse = await fetch(`${baseUrl}/`, { method: "HEAD" });
  assert.equal(headResponse.status, 200);
  assert.equal(await headResponse.text(), "");

  const methodResponse = await fetch(`${baseUrl}/`, { method: "POST" });
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get("allow"), "GET, HEAD");

  const hiddenFileResponse = await fetch(`${baseUrl}/.env`);
  assert.equal(hiddenFileResponse.status, 404);

  const sourceMapResponse = await fetch(`${baseUrl}/assets/application.js.map`);
  assert.equal(sourceMapResponse.status, 404);

  console.log("Production verification passed: build, SPA fallback, HEAD handling, health check, and security headers.");
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  console.error("Production server output:\n", logs);
  process.exitCode = 1;
} finally {
  await stopServer();
}
