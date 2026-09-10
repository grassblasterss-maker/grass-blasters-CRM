import crypto from 'node:crypto';

export function safeEqual(left, right) {
  const a = Buffer.from(String(left ?? ''));
  const b = Buffer.from(String(right ?? ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function authorizeApiKey(req, expected) {
  if (!expected) return { ok: false, status: 503, error: 'api_key_not_configured' };
  const direct = req.headers?.['x-api-key'];
  const auth = req.headers?.authorization;
  const bearer = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  const received = Array.isArray(direct) ? direct[0] : direct || bearer;
  if (!received || !safeEqual(received, expected)) return { ok: false, status: 401, error: 'unauthorized' };
  return { ok: true };
}

export function webhookSignature(secret, body) {
  if (!secret) return undefined;
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}
