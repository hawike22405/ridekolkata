import type { z } from 'zod';
import { visualConfigInput, visualConfigResponse } from '../src/visual-contract.js';

/** Types inferred from the actual runtime validators; no independent duplicate interface. */
export type VisualConfigInput = z.infer<typeof visualConfigInput>;
export type VisualConfigResponse = z.infer<typeof visualConfigResponse>;
