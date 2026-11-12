export function webConfig(env: NodeJS.ProcessEnv = process.env) {
  const production = env.NODE_ENV === "production";
  const exact = (value: string, name: string) => {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${name} must be an exact HTTP(S) origin`);
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== value ||
      url.username ||
      url.password
    )
      throw new Error(`${name} must be an exact HTTP(S) origin`);
    return url;
  };
  const origin =
    env.PUBLIC_ORIGIN || (production ? "" : "http://localhost:3000");
  const publicUrl = exact(origin, "PUBLIC_ORIGIN");
  if (production && publicUrl.protocol !== "https:")
    throw new Error("Production PUBLIC_ORIGIN requires HTTPS");
  const backend =
    env.BACKEND_ORIGIN || (production ? "" : "http://localhost:3001");
  exact(backend, "BACKEND_ORIGIN");
  if (backend === origin)
    throw new Error("BACKEND_ORIGIN must point to the separate API service");
  const assets = (env.MODEL_ASSET_ORIGINS || "").split(",").filter(Boolean);
  for (const value of assets)
    if (exact(value, "MODEL_ASSET_ORIGINS").protocol !== "https:")
      throw new Error("Model asset origins require HTTPS");
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid PORT");
  return { production, origin, backend, assets, port };
}
