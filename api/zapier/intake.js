import { asObject, contentLengthTooLarge, methodNotAllowed, requiredStrings } from '../../lib/http.js';
import { safeEqual } from '../../lib/security.js';
import { postToZapier, ZapierConfigError, ZapierResponseError } from '../../lib/zapier.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (contentLengthTooLarge(req)) return res.status(413).json({ error: 'payload_too_large' });
  const expected = process.env.ZAPIER_WEBHOOK_SECRET;
  if (!expected) return res.status(503).json({ error: 'webhook_secret_not_configured' });
  const received = req.headers?.['x-webhook-secret'];
  if (!received || !safeEqual(Array.isArray(received) ? received[0] : received, expected)) {
    return res.status(401).json({ error: 'invalid_secret' });
  }

  const body = asObject(req.body);
  const missing = requiredStrings(body, ['source', 'eventType', 'entityType', 'externalId']);
  if (missing.length) return res.status(400).json({ error: 'missing_fields', missing });
  const eventKey = [body.source, body.eventType, body.externalId].map(normalizeKeyPart).join(':');
  const event = {
    schemaVersion: 1,
    eventKey,
    source: body.source.trim().toLowerCase(),
    eventType: body.eventType.trim().toLowerCase(),
    entityType: body.entityType.trim().toLowerCase(),
    externalId: body.externalId.trim(),
    occurredAt: validDate(body.occurredAt) || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    record: asObject(body.record),
    attribution: asObject(body.attribution)
  };

  try {
    const upstream = await postToZapier(process.env.ZAPIER_TABLES_INTAKE_WEBHOOK_URL, event);
    return res.status(202).json({ accepted: true, eventKey, persistence: 'zapier_tables', upstreamStatus: upstream.status });
  } catch (error) {
    if (error instanceof ZapierConfigError) return res.status(503).json({ error: error.message, eventKey });
    if (error instanceof ZapierResponseError) return res.status(502).json({ error: error.message, eventKey, upstreamStatus: error.status });
    return res.status(502).json({ error: 'zapier_unavailable', eventKey });
  }
}

function normalizeKeyPart(value) { return String(value).trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-'); }
function validDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}
