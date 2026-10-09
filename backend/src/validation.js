import { z } from 'zod';
export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const point = z.strictObject({type:z.literal('Point'),coordinates:z.tuple([z.number().finite().min(-180).max(180),z.number().finite().min(-90).max(90)])});
export const routeInput = z.strictObject({name:z.string().trim().min(1).max(120),description:z.string().max(2000),start:point,end:point,waypoints:z.array(point).max(200),enabled:z.boolean()});
// Monetary fields are integer minor units (paise for INR). No implicit tariff values.
export const pricingInput = z.strictObject({name:z.string().trim().min(1).max(120),currency:z.literal('INR'),baseFareMinor:z.number().int().min(0).max(100000000),perMinuteMinor:z.number().int().min(0).max(100000000),surgeMultiplier:z.number().finite().min(0.01).max(100),enabled:z.boolean()});
export const credentials = z.strictObject({email:z.email().trim().toLowerCase(),password:z.string().min(12).max(128)});
export const versionInput = z.number().int().nonnegative();
export const pageInput = z.strictObject({page:z.coerce.number().int().min(1).max(100000).default(1),limit:z.coerce.number().int().min(1).max(100).default(25)});
