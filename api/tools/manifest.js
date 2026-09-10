import { methodNotAllowed } from '../../lib/http.js';
import { toolRegistry } from '../../lib/tool-registry.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return res.status(200).json({ version: '0.3.0', tools: toolRegistry });
}
