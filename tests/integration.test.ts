import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { webConfig } from "../server-config";
import {
  inspectModel,
  MAX_MODEL_BYTES,
  fetchModel,
} from "../src/integration/modelSafety";
import { getRoutes, readApi, ApiError } from "../src/integration/api";
import { z } from "zod";
process.env.NODE_ENV = "test";
const { createWebServer } = await import("../server");
test("production refuses missing origins, insecure public origins and injected origin paths", () => {
  for (const env of [
    { NODE_ENV: "production" },
    {
      NODE_ENV: "production",
      PUBLIC_ORIGIN: "http://web.invalid",
      BACKEND_ORIGIN: "http://api.invalid",
    },
    { PUBLIC_ORIGIN: "http://web.invalid/path" },
    { BACKEND_ORIGIN: "http://user:pass@api.invalid" },
    { MODEL_ASSET_ORIGINS: "http://assets.invalid" },
  ])
    assert.throws(() => webConfig(env));
  assert.equal(
    webConfig({
      NODE_ENV: "production",
      PUBLIC_ORIGIN: "https://web.invalid",
      BACKEND_ORIGIN: "http://api.invalid",
    }).origin,
    "https://web.invalid",
  );
});
test("HTTP proxy forwards exact path, authorization, origin, ETag and raw request body; unavailable APIs return JSON", async () => {
  const upstream = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      res.setHeader("ETag", '"version"');
      res.end(
        JSON.stringify({
          path: req.url,
          auth: req.headers.authorization,
          origin: req.headers.origin,
          body: Buffer.concat(chunks).toString(),
        }),
      );
    });
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const upstreamPort = (upstream.address() as { port: number }).port;
  const { server } = await createWebServer({
    ...webConfig({
      NODE_ENV: "production",
      PUBLIC_ORIGIN: "https://web.invalid",
      BACKEND_ORIGIN: `http://127.0.0.1:${upstreamPort}`,
    }),
    port: 0,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  try {
    const response = await fetch(base + "/api/admin/routes?limit=1", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-only",
        Origin: "https://web.invalid",
        "Content-Type": "application/json",
      },
      body: '{"enabled":false}',
    });
    assert.equal(response.headers.get("etag"), '"version"');
    assert.deepEqual(await response.json(), {
      path: "/api/admin/routes?limit=1",
      auth: "Bearer test-only",
      origin: "https://web.invalid",
      body: '{"enabled":false}',
    });
    assert.ok(
      response.headers
        .get("content-security-policy")
        ?.includes("frame-ancestors"),
    );
    await new Promise<void>((r) => upstream.close(() => r()));
    const failure = await fetch(base + "/api/catalog/routes");
    assert.equal(failure.status, 502);
    assert.equal(failure.headers.get("cache-control"), "no-store");
    assert.deepEqual(await failure.json(), {
      error: "API service unavailable",
    });
  } finally {
    server.closeAllConnections();
    server.close();
    upstream.close();
  }
});
test("real websocket upgrades through web proxy with rider auth and browser origin", async () => {
  const upstream = createServer(),
    sockets = new Server(upstream, {
      transports: ["websocket"],
      allowRequest: (req, done) =>
        done(null, req.headers.origin === "https://web.invalid"),
    });
  sockets.use((socket, next) =>
    next(
      socket.handshake.auth.token === "test-only"
        ? undefined
        : new Error("Rejected"),
    ),
  );
  sockets.on("connection", (socket) =>
    socket.on("check", (data, ack) => ack(data)),
  );
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const { server } = await createWebServer({
    ...webConfig({
      NODE_ENV: "production",
      PUBLIC_ORIGIN: "https://web.invalid",
      BACKEND_ORIGIN: `http://127.0.0.1:${(upstream.address() as { port: number }).port}`,
    }),
    port: 0,
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const client = io(
    `http://127.0.0.1:${(server.address() as { port: number }).port}`,
    {
      transports: ["websocket"],
      auth: { token: "test-only" },
      extraHeaders: { Origin: "https://web.invalid" },
      reconnection: false,
      timeout: 3000,
    },
  );
  try {
    await new Promise<void>((resolve, reject) => {
      client.once("connect", resolve);
      client.once("connect_error", reject);
    });
    assert.equal(
      await client.timeout(2000).emitWithAck("check", "acknowledged"),
      "acknowledged",
    );
  } finally {
    client.disconnect();
    await new Promise<void>((r) => sockets.close(() => r()));
    server.closeAllConnections();
    server.close();
  }
});
test("model inspection rejects external dependencies, invalid binary headers and oversized declarations", () => {
  const encode = (v: unknown) =>
    new TextEncoder().encode(JSON.stringify(v)).buffer;
  assert.equal(
    inspectModel(encode({ asset: { version: "2.0" } })).asset.version,
    "2.0",
  );
  for (const value of [
    { asset: { version: "1.0" } },
    {
      asset: { version: "2.0" },
      images: [{ uri: "https://assets.invalid/texture.png" }],
    },
    {
      asset: { version: "2.0" },
      buffers: [{ byteLength: MAX_MODEL_BYTES + 1 }],
    },
    { asset: { version: "2.0" }, buffers: [{ byteLength: -1 }] },
  ])
    assert.throws(() => inspectModel(encode(value)));
  const bad = new ArrayBuffer(20),
    view = new DataView(bad);
  view.setUint32(0, 0x46546c67, true);
  assert.throws(() => inspectModel(bad));
});
test("frontend refuses invalid API data and missing configuration without fallback", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: [{ name: "invalid" }] }), {
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(
      getRoutes(1),
      (error) => error instanceof ApiError && error.status === 502,
    );
    globalThis.fetch = async () =>
      new Response('{"error":"Not configured"}', { status: 404 });
    await assert.rejects(
      readApi("/api/ui/3d-config", z.object({})),
      (error) => error instanceof ApiError && error.status === 404,
    );
    globalThis.fetch = async () => new Response("not a model");
    await assert.rejects(
      fetchModel("/test-only.glb", new AbortController().signal),
    );
  } finally {
    globalThis.fetch = original;
  }
});
