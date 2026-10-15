import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { createServer } from "node:http";
import path from "node:path";
import { Socket } from "node:net";
import httpProxy from "http-proxy";
import { webConfig } from "./server-config";
export async function createWebServer(config = webConfig()) {
  const app = express(),
    server = createServer(app);
  app.disable("x-powered-by");
  const proxy = httpProxy.createProxyServer({
    target: config.backend,
    changeOrigin: false,
    xfwd: true,
  });
  proxy.on("error", (_error, _req, res) => {
    if ("writeHead" in res) {
      if (!res.headersSent)
        res.writeHead(502, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
      res.end(JSON.stringify({ error: "API service unavailable" }));
    } else res.destroy();
  });
  const isApi = (pathname: string) =>
    ["/api", "/admin", "/socket.io", "/health"].some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
    );
  app.use(
    helmet({
      contentSecurityPolicy: config.production
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "blob:", ...config.assets],
              connectSrc: [
                "'self'",
                "blob:",
                "data:",
                config.origin.replace(/^http/, "ws"),
                ...config.assets,
              ],
              workerSrc: ["'self'", "blob:"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'self'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      strictTransportSecurity: config.production ? undefined : false,
    }),
  );
  app.use((req, res, next) => {
    if (isApi(req.path)) proxy.web(req, res);
    else next();
  });
  server.on("upgrade", (req, socket, head) => {
    if (req.url?.split("?")[0].replace(/\/$/, "") === "/socket.io")
      proxy.ws(req, socket as Socket, head);
    else if (config.production) socket.destroy();
  });
  // API failures must never resolve to the SPA document.
  app.use(["/api", "/admin", "/socket.io", "/health"], (_req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  let closeDev: undefined | (() => Promise<void>);
  if (config.production) {
    app.use(
      express.static(path.resolve("dist"), { index: false, dotfiles: "deny" }),
    );
    app.get("*", (_req, res) => {
      res.set("Cache-Control", "no-store");
      res.sendFile(path.resolve("dist/index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
    closeDev = () => vite.close();
  }
  return { app, server, closeDev };
}
if (process.env.NODE_ENV !== "test") {
  const config = webConfig();
  createWebServer(config)
    .then(({ server }) => {
      server.listen(config.port, "0.0.0.0", () =>
        console.log(
          `Ride Kolkata web service listening on port ${config.port}`,
        ),
      );
    })
    .catch(() => {
      console.error("Web service could not start");
      process.exitCode = 1;
    });
}
