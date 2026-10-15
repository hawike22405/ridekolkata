import { z } from "zod";
import { routePage, pricingPage } from "../../backend/src/catalog-contract.js";
import { visualConfigResponse } from "../../backend/src/visual-contract.js";
import { rideEnvelope } from "../../backend/src/telemetry/response-contract.js";
export { visualConfigResponse };
export type Routes = z.infer<typeof routePage>;
export type Prices = z.infer<typeof pricingPage>;
export type Visual = z.infer<typeof visualConfigResponse>;
export type Ride = z.infer<typeof rideEnvelope>["ride"];
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readApi<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    credentials: "omit",
    headers: { ...options.headers },
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      if (typeof body.error === "string") detail = body.error;
    } catch {}
    throw new ApiError(
      response.status,
      detail || `Request failed (${response.status})`,
    );
  }
  const data = await response.json();
  const result = schema.safeParse(data);
  if (!result.success)
    throw new ApiError(502, "The server returned invalid data.");
  return result.data;
}
export const getRoutes = (page: number, signal?: AbortSignal) =>
  readApi(`/api/catalog/routes?page=${page}&limit=12`, routePage, { signal });
export const getPrices = (page: number, signal?: AbortSignal) =>
  readApi(`/api/catalog/pricing?page=${page}&limit=12`, pricingPage, {
    signal,
  });
export const getVisual = (signal?: AbortSignal) =>
  readApi("/api/ui/3d-config", visualConfigResponse, { signal });
export const getRide = (token: string, signal?: AbortSignal) =>
  readApi("/api/rides/current", rideEnvelope, {
    signal,
    headers: { Authorization: `Bearer ${token}` },
  });
export const finishRide = (token: string) =>
  readApi("/api/rides/finish", rideEnvelope, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
