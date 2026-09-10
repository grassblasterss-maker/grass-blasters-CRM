import test from 'node:test';
import assert from 'node:assert/strict';
import intake from '../api/zapier/intake.js';
import execute from '../api/tools/execute.js';
import health from '../api/health.js';
import { request, responseMock } from './helpers.js';

test('intake fails closed without its webhook secret', async () => {
  delete process.env.ZAPIER_WEBHOOK_SECRET;
  const res = responseMock();
  await intake(request('POST'), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.error, 'webhook_secret_not_configured');
});

test('intake rejects invalid credentials', async () => {
  process.env.ZAPIER_WEBHOOK_SECRET = 'correct';
  const res = responseMock();
  await intake(request('POST', {}, { 'x-webhook-secret': 'wrong' }), res);
  assert.equal(res.statusCode, 401);
});

test('intake normalizes and forwards an event key', async () => {
  process.env.ZAPIER_WEBHOOK_SECRET = 'correct';
  process.env.ZAPIER_TABLES_INTAKE_WEBHOOK_URL = 'https://example.test/intake';
  const originalFetch = global.fetch;
  let forwarded;
  global.fetch = async (_url, options) => {
    forwarded = JSON.parse(options.body);
    return { ok: true, status: 200, text: async () => '{"status":"success"}' };
  };
  try {
    const res = responseMock();
    await intake(request('POST', {
      source: 'Jobber', eventType: 'Quote Sent', entityType: 'Quote', externalId: '4821'
    }, { 'x-webhook-secret': 'correct' }), res);
    assert.equal(res.statusCode, 202);
    assert.equal(res.body.eventKey, 'jobber:quote-sent:4821');
    assert.equal(forwarded.eventKey, 'jobber:quote-sent:4821');
  } finally { global.fetch = originalFetch; }
});

test('yellow tool requires approval before calling Zapier', async () => {
  process.env.GRASS_BLASTERS_API_KEY = 'api-key';
  const res = responseMock();
  await execute(request('POST', { tool: 'create_jobber_request', arguments: {} }, {
    'x-api-key': 'api-key', 'idempotency-key': 'test-1'
  }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.error, 'approval_required');
});

test('red tools remain disabled even with approval', async () => {
  process.env.GRASS_BLASTERS_API_KEY = 'api-key';
  delete process.env.ALLOW_RED_TOOLS;
  const res = responseMock();
  await execute(request('POST', { tool: 'issue_refund', approval: { confirmed: true } }, {
    'x-api-key': 'api-key', 'idempotency-key': 'test-2'
  }), res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, 'red_tools_disabled');
});

test('approved yellow tool forwards an auditable envelope', async () => {
  process.env.GRASS_BLASTERS_API_KEY = 'api-key';
  process.env.ZAPIER_ACTION_WEBHOOK_URL = 'https://example.test/actions';
  const originalFetch = global.fetch;
  let forwarded;
  global.fetch = async (_url, options) => {
    forwarded = JSON.parse(options.body);
    return { ok: true, status: 200, text: async () => '' };
  };
  try {
    const res = responseMock();
    await execute(request('POST', {
      tool: 'create_jobber_request',
      arguments: { clientId: '123', title: 'Patio request' },
      approval: { confirmed: true, approvedBy: 'Dominic', confirmation: 'Create this request' }
    }, { 'x-api-key': 'api-key', 'idempotency-key': 'request-123-patio' }), res);
    assert.equal(res.statusCode, 202);
    assert.equal(forwarded.tool.risk, 'yellow');
    assert.equal(forwarded.approval.approvedBy, 'Dominic');
    assert.equal(forwarded.idempotencyKey, 'request-123-patio');
  } finally { global.fetch = originalFetch; }
});

test('health reports configuration without returning secret values', () => {
  delete process.env.ZAPIER_ACTION_WEBHOOK_URL;
  const res = responseMock();
  health(request('GET'), res);
  assert.equal(res.statusCode, 503);
  assert.ok(res.body.missing.includes('ZAPIER_ACTION_WEBHOOK_URL'));
  assert.equal(JSON.stringify(res.body).includes('api-key'), false);
});
