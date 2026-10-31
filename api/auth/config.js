import { accessConfigured } from '../../lib/access.js';
import { methodNotAllowed } from '../../lib/http.js';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const configured = accessConfigured();
  return res.status(200).json({ configured, publishableKey: configured ? process.env.CLERK_PUBLISHABLE_KEY : null });
}
