import crypto from 'node:crypto';
import { asObject, contentLengthTooLarge, methodNotAllowed, requiredStrings } from '../../lib/http.js';
import { authorizeApiKey } from '../../lib/security.js';
import { findTool } from '../../lib/tool-registry.js';
import { postToZapier, ZapierConfigError, ZapierResponseError } from '../../lib/zapier.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (contentLengthTooLarge(req)) return res.status(413).json({ error: 'payload_too_large' });
  const auth = authorizeApiKey(req, process.env.GRASS_BLASTERS_API_KEY);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const body = asObject(req.body);
  const missing = requiredStrings(body, ['tool']);
  if (missing.length) return res.status(400).json({ error: 'missing_fields', missing });
  const registered = findTool(body.tool);
  if (!registered) return res.status(404).json({ error: 'unknown_tool' });
  const approval = asObject(body.approval);
  const idempotencyKey = req.headers?.['idempotency-key'];
  if (registered.mode === 'write' && (typeof idempotencyKey !== 'string' || !idempotencyKey.trim())) {
    return res.status(400).json({ error: 'idempotency_key_required' });
  }
  if (registered.risk !== 'green' && approval.confirmed !== true) {
    return res.status(409).json({ error: 'approval_required', risk: registered.risk, tool: registered.name });
  }
  if (registered.risk === 'red' && process.env.ALLOW_RED_TOOLS !== 'true') {
    return res.status(403).json({ error: 'red_tools_disabled', tool: registered.name });
  }

  const requestId = crypto.randomUUID();
  const envelope = {
    schemaVersion: 1,
    requestId,
    idempotencyKey: typeof idempotencyKey === 'string' ? idempotencyKey : requestId,
    requestedAt: new Date().toISOString(),
    tool: registered,
    arguments: asObject(body.arguments),
    approval: registered.risk === 'green' ? null : {
      approvedBy: String(approval.approvedBy || 'Dominic'),
      approvedAt: String(approval.approvedAt || new Date().toISOString()),
      confirmation: String(approval.confirmation || '')
    }
  };

  try {
    const upstream = await postToZapier(process.env.ZAPIER_ACTION_WEBHOOK_URL, envelope);
    return res.status(202).json({ accepted: true, requestId, risk: registered.risk, upstreamStatus: upstream.status });
  } catch (error) {
    if (error instanceof ZapierConfigError) return res.status(503).json({ error: error.message });
    if (error instanceof ZapierResponseError) return res.status(502).json({ error: error.message, upstreamStatus: error.status });
    return res.status(502).json({ error: 'zapier_unavailable' });
  }
}
