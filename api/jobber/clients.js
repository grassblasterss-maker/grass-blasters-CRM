import { requireMember } from '../../lib/access.js';
import { methodNotAllowed } from '../../lib/http.js';
import { readClients } from '../../lib/jobber.js';
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!await requireMember(req, res, 'clients')) return;
  const after = req.query?.after ?? null;
  if (after !== null && (typeof after !== 'string' || after.length > 1024)) return res.status(400).json({ error: 'invalid_cursor' });
  const result = await readClients(after);
  return res.status(result.status).json(result.body);
}
