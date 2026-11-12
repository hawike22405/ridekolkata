import { z } from 'zod';
import { objectId } from '../validation.js';
export const LIMITS = Object.freeze({ maxSamples: 20000, maxDurationMs: 86400000, minIntervalMs: 250, maxAgeMs: 30000, maxGapMs: 30000, liveWindowMs: 30000, maxSpeedMps: 25, tokenSeconds: 3600 });
export const coordinate = z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90)]);
export const startInput = z.strictObject({ requestId: z.uuid(), riderRef: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_:@.-]+$/), routeId: objectId });
export const pingInput = z.strictObject({ sequence: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER), capturedAt: z.iso.datetime(), coordinates: coordinate, accuracyMeters: z.number().finite().positive().max(50) });
export const dateRange = z.strictObject({ from: z.iso.datetime(), to: z.iso.datetime(), routeId: objectId.optional() }).refine(v => Date.parse(v.to)>Date.parse(v.from) && Date.parse(v.to)-Date.parse(v.from)<=31*86400000, 'Use an increasing date range of at most 31 days');
export const emptyInput = z.strictObject({});
export const pageInput = z.strictObject({ page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(100).default(25) });
export const samplesInput = z.strictObject({ after:z.coerce.number().int().min(0).max(LIMITS.maxSamples).default(0),limit:z.coerce.number().int().min(1).max(200).default(100) });
export function fault(status, code, message) { return Object.assign(new Error(message), { status, code }); }
