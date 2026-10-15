import { z } from "zod";
import { objectId } from "../validation.js";
import { coordinate } from "./contracts.js";
const number = z.number().finite().nonnegative(),
  date = z.iso.datetime();
export const rideSummarySchema = z.strictObject({
  id: objectId,
  riderRef: z.string(),
  routeId: objectId,
  routeName: z.string(),
  status: z.enum(["active", "completed", "expired"]),
  startedAt: date,
  endedAt: date.nullable(),
  expiresAt: date,
  serverTime: date,
  durationSeconds: number,
  sampleCount: z.number().int().nonnegative(),
  lastSequence: z.number().int().nonnegative(),
  distanceMeters: number.nullable(),
  observedSeconds: number,
  gapSeconds: number,
  averageSpeedKmh: number.nullable(),
  sessionAverageSpeedKmh: number.nullable(),
  currentSpeedKmh: number.nullable(),
  trackingFresh: z.boolean(),
  lastReceivedAt: date.nullable(),
  lastPosition: z
    .strictObject({ type: z.literal("Point"), coordinates: coordinate })
    .nullable(),
});
export const rideEnvelope = z.strictObject({ ride: rideSummarySchema });
export const pingAck = z.discriminatedUnion("ok", [
  z.strictObject({
    ok: z.literal(true),
    duplicate: z.boolean(),
    ride: rideSummarySchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
]);
