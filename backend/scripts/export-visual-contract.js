import { writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { visualConfigResponse } from '../src/visual-contract.js';
// JSON Schema captures structural bounds, but unit-quaternion and URL refinements
// remain enforced by the executable Zod contract. Do not replace it with this file.
const schema = z.toJSONSchema(visualConfigResponse);
schema.description = 'Ride Kolkata visual configuration response, version 1. The executable Zod contract additionally enforces unit-length quaternions and safe model URLs.';
await writeFile(new URL('../contracts/visual-config.schema.json', import.meta.url), JSON.stringify(schema, null, 2) + '\n');
