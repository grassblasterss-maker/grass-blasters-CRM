import test from 'node:test';
import assert from 'node:assert/strict';
import { readClients } from '../lib/jobber.js';
test('missing Jobber configuration never returns sample clients', async () => {
  delete process.env.JOBBER_ACCESS_TOKEN; const r = await readClients(); assert.equal(r.status, 503); assert.equal(r.body.clients, undefined);
});
test('paginated clients use a fixed read query and redact upstream details', async () => {
  process.env.JOBBER_ACCESS_TOKEN = 'test-token'; process.env.JOBBER_API_VERSION = 'test-version';
  const original = global.fetch;
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://api.getjobber.com/api/graphql'); assert.equal(options.headers.authorization, 'Bearer test-token');
      const body = JSON.parse(options.body); assert.equal(body.variables.after, 'cursor'); assert.ok(!body.query.includes('mutation'));
      return { ok: true, status: 200, json: async () => ({ data: { clients: { nodes: [{ id: '1', name: '<img onerror=alert(1)>', private: 'no' }], pageInfo: { hasNextPage: true, endCursor: 'next' } } } }) };
    };
    const result = await readClients('cursor'); assert.equal(result.status, 200); assert.equal(result.body.pageInfo.endCursor, 'next'); assert.equal(result.body.clients[0].private, undefined); assert.ok(result.body.fetchedAt);
    for (const [code, expected] of [[401, 503], [429, 429], [500, 502]]) { global.fetch = async () => ({ status: code, ok: false }); assert.equal((await readClients()).status, expected); }
    global.fetch = async () => ({ status: 200, ok: true, json: async () => ({ errors: [{ message: 'sensitive upstream detail' }] }) }); const failed = await readClients(); assert.equal(failed.status, 502); assert.ok(!JSON.stringify(failed).includes('sensitive'));
  } finally { global.fetch = original; }
});
