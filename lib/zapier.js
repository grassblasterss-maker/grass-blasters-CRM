import { webhookSignature } from './security.js';

export async function postToZapier(url, payload, { timeoutMs = 12_000 } = {}) {
  if (!url) throw new ZapierConfigError('zapier_webhook_not_configured');
  const body = JSON.stringify(payload);
  const headers = { 'content-type': 'application/json', 'user-agent': 'grass-blasters-os/0.3.0' };
  const signature = webhookSignature(process.env.ZAPIER_OUTBOUND_SIGNING_SECRET, body);
  if (signature) headers['x-grass-blasters-signature'] = signature;

  const response = await fetch(url, {
    method: 'POST', headers, body, signal: AbortSignal.timeout(timeoutMs)
  });
  const text = await response.text();
  let result;
  try { result = text ? JSON.parse(text) : null; } catch { result = text || null; }
  if (!response.ok) throw new ZapierResponseError(response.status, result);
  return { status: response.status, result };
}

export class ZapierConfigError extends Error {}
export class ZapierResponseError extends Error {
  constructor(status, result) {
    super('zapier_request_failed');
    this.status = status;
    this.result = result;
  }
}
