import { z } from "zod";
import { routeInput, pricingInput, objectId } from "./validation.js";
export const publicRoute = routeInput.extend({
  id: objectId,
  updatedAt: z.iso.datetime(),
});
export const publicPricing = pricingInput.extend({
  id: objectId,
  updatedAt: z.iso.datetime(),
});
const meta = {
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
};
export const routePage = z.strictObject({
  data: z.array(publicRoute),
  ...meta,
});
export const pricingPage = z.strictObject({
  data: z.array(publicPricing),
  ...meta,
});
