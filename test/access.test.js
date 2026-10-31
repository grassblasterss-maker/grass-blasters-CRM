import test from 'node:test';
import assert from 'node:assert/strict';
import { memberForUser, requireMember } from '../lib/access.js';
import config from '../api/auth/config.js';
import clients from '../api/jobber/clients.js';
import status from '../api/integrations/status.js';
import { responseMock, request } from './helpers.js';
const env = { JARVIS_OWNER_EMAILS: 'owner@example.test', JARVIS_ASSISTANT_EMAILS: 'assistant@example.test' };
const user = email => ({ id: 'user_1', primaryEmailAddressId: 'email_1', emailAddresses: [{ id: 'email_1', emailAddress: email, verification: { status: 'verified' } }] });
const setup = () => Object.assign(process.env, env, { CLERK_SECRET_KEY: 'test-secret', CLERK_PUBLISHABLE_KEY: 'test-public', JARVIS_APP_ORIGIN: 'https://jarvis.example.test' });
const fakeClient = (email, sessionStatus = 'active') => ({
  authenticateRequest: async (_request, options) => { assert.deepEqual(options.authorizedParties, ['https://jarvis.example.test']); assert.equal(options.acceptsToken, 'session_token'); return { isAuthenticated: true, toAuth: () => ({ userId: 'user_1', sessionId: 'session_1' }) }; },
  users: { getUser: async () => user(email) },
  sessions: { getSession: async () => ({ status: sessionStatus, userId: 'user_1' }) }
});
test('only verified primary allowlisted emails receive roles', () => {
  assert.equal(memberForUser(user('OWNER@example.test'), env).role, 'owner');
  assert.equal(memberForUser(user('stranger@example.test'), env), null);
  const unverified = user('owner@example.test'); unverified.emailAddresses[0].verification.status = 'unverified';
  assert.equal(memberForUser(unverified, env), null);
  assert.equal(memberForUser({ ...user('owner@example.test'), banned: true }, env), null);
  assert.equal(memberForUser({ ...user('owner@example.test'), locked: true }, env), null);
  const assistant = memberForUser(user('assistant@example.test'), env);
  assert.ok(assistant.permissions.includes('clients'));
  assert.ok(!assistant.permissions.includes('finance'));
  assert.ok(!assistant.permissions.includes('connections'));
});
test('missing auth configuration fails closed and exposes no key', async () => {
  delete process.env.CLERK_SECRET_KEY;
  const res = responseMock(); await requireMember(request('GET'), res, 'clients'); assert.equal(res.statusCode, 503);
  const publicConfig = responseMock(); config(request('GET'), publicConfig);
  assert.deepEqual(publicConfig.body, { configured: false, publishableKey: null });
});
test('cookie and shared automation key cannot replace individual sign-in', async () => {
  setup();
  for (const headers of [{ cookie: '__session=fake' }, { 'x-api-key': 'anything' }, {}]) {
    const res = responseMock(); await requireMember(request('GET', {}, headers), res, 'clients'); assert.equal(res.statusCode, 401);
  }
});
test('assistant is forbidden from owner endpoint and permitted client reads', async () => {
  setup(); const req = request('GET', {}, { authorization: 'Bearer session-token' });
  const denied = responseMock(); assert.equal(await requireMember(req, denied, 'connections', fakeClient('assistant@example.test')), null); assert.equal(denied.statusCode, 403);
  const allowed = responseMock(); assert.equal((await requireMember(req, allowed, 'clients', fakeClient('assistant@example.test'))).role, 'assistant'); assert.equal(allowed.headers['Cache-Control'], 'private, no-store');
});
test('revoked session and removed member cannot access records', async () => {
  setup(); const req = request('GET', {}, { authorization: 'Bearer session-token' });
  const revoked = responseMock(); await requireMember(req, revoked, 'clients', fakeClient('owner@example.test', 'revoked')); assert.equal(revoked.statusCode, 401);
  const removed = responseMock(); await requireMember(req, removed, 'clients', fakeClient('removed@example.test')); assert.equal(removed.statusCode, 403);
});
test('identity provider outage returns closed failure without leaking details', async () => {
  setup(); const res = responseMock(); await requireMember(request('GET', {}, { authorization: 'Bearer secret-token' }), res, 'clients', { authenticateRequest: async () => { throw new Error('secret-upstream-response'); } });
  assert.equal(res.statusCode, 503); assert.equal(JSON.stringify(res.body).includes('secret'), false);
});
test('business endpoints reject anonymous callers before fetching data', async () => {
  setup(); for (const handler of [clients, status]) { const res = responseMock(); await handler(request('GET'), res); assert.equal(res.statusCode, 401); }
});
