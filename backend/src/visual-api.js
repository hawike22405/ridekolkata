import { z } from 'zod';
import { visualConfigInput, visualConfigResponse } from './visual-contract.js';
import { visualRepository } from './visual-model.js';

const fail = (status, message) => Object.assign(new Error(message), { status });
function expectedRevision(req) {
  const header = req.get('If-Match');
  if (!header) throw fail(428, 'If-Match revision required');
  if (!/^"[a-f\d-]+"$/i.test(header) || !z.uuid().safeParse(header.slice(1, -1)).success) {
    throw fail(400, 'If-Match must contain a quoted revision UUID');
  }
  return header.slice(1, -1);
}
export function serializeVisualConfig(record) {
  const raw = typeof record?.toObject === 'function' ? record.toObject() : record;
  // Corrupt DB output is a service fault, not a client validation error.
  try {
    return visualConfigResponse.parse({
      data: raw.config,
      revision: raw.revision,
      updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
    });
  } catch { throw fail(503, 'Stored visual configuration is invalid'); }
}
export function visualHandlers({ repository = visualRepository, ensureDb = async () => {} } = {}) {
  function send(res, record, status = 200) {
    const body = serializeVisualConfig(record);
    return res.status(status).set('Cache-Control', 'no-store').set('ETag', `"${body.revision}"`).json(body);
  }
  return {
    async read(_req, res) {
      await ensureDb();
      const record = await repository.read();
      if (!record) throw fail(404, 'Visual configuration has not been configured');
      return send(res, record);
    },
    async create(req, res) {
      const input = visualConfigInput.parse(req.body);
      await ensureDb();
      return send(res, await repository.create(input), 201);
    },
    async replace(req, res) {
      const revision = expectedRevision(req);
      const input = visualConfigInput.parse(req.body);
      await ensureDb();
      const record = await repository.replace(revision, input);
      if (!record) throw fail(409, 'Configuration changed or was deleted; reload before saving');
      return send(res, record);
    },
    async remove(req, res) {
      const revision = expectedRevision(req);
      await ensureDb();
      const result = await repository.remove(revision);
      if (!result.deletedCount) throw fail(409, 'Configuration changed or was deleted; reload before deleting');
      return res.status(204).end();
    },
  };
}
