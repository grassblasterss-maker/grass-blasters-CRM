import { methodNotAllowed } from '../lib/http.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const required = ['ZAPIER_WEBHOOK_SECRET', 'ZAPIER_ACTION_WEBHOOK_URL', 'ZAPIER_TABLES_INTAKE_WEBHOOK_URL', 'GRASS_BLASTERS_API_KEY'];
  const missing = required.filter((name) => !process.env[name]);
  return res.status(missing.length ? 503 : 200).json({
    ok: missing.length === 0,
    service: 'grass-blasters-os',
    version: '0.3.0',
    mode: missing.length ? 'configuration_required' : 'zapier_ready',
    missing
  });
}
