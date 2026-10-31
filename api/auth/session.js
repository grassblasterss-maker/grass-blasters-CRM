import { requireMember } from '../../lib/access.js';
import { methodNotAllowed } from '../../lib/http.js';
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const member = await requireMember(req, res);
  if (member) return res.status(200).json({ member });
}
