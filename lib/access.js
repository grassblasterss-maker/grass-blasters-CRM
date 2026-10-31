import { createClerkClient } from '@clerk/backend';

const ownerPermissions = ['overview', 'clients', 'finance', 'design', 'content', 'checklist', 'connections'];
const assistantPermissions = ['overview', 'clients', 'design', 'content'];
const emails = value => String(value || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);

export function accessConfigured(env = process.env) {
  return Boolean(env.CLERK_SECRET_KEY && env.CLERK_PUBLISHABLE_KEY && env.JARVIS_APP_ORIGIN && emails(env.JARVIS_OWNER_EMAILS).length);
}

export function memberForUser(user, env = process.env) {
  const primary = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId && e.verification?.status === 'verified');
  if (!primary || user.banned || user.locked) return null;
  const email = primary.emailAddress.toLowerCase();
  const role = emails(env.JARVIS_OWNER_EMAILS).includes(email) ? 'owner' : emails(env.JARVIS_ASSISTANT_EMAILS).includes(email) ? 'assistant' : null;
  if (!role) return null;
  return { id: user.id, email, role, permissions: role === 'owner' ? ownerPermissions : assistantPermissions };
}

export async function requireMember(req, res, permission, clientOverride) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization, Cookie');
  if (!accessConfigured()) { res.status(503).json({ error: 'sign_in_not_configured' }); return null; }
  // Explicit bearer sessions only. Browser cookies or a shared automation key cannot
  // substitute for an individual identity or trigger cookie-based CSRF.
  if (!/^Bearer \S+$/.test(req.headers?.authorization || '')) {
    res.status(401).json({ error: 'sign_in_required' }); return null;
  }
  try {
    const origin = new URL(process.env.JARVIS_APP_ORIGIN).origin;
    const client = clientOverride || createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });
    const headers = new Headers({ authorization: req.headers.authorization });
    const state = await client.authenticateRequest(new Request(new URL(req.url || '/', origin), { headers }), {
      authorizedParties: [origin], acceptsToken: 'session_token'
    });
    if (!state.isAuthenticated) { res.status(401).json({ error: 'session_expired' }); return null; }
    const { userId, sessionId } = state.toAuth();
    if (!userId || !sessionId) { res.status(401).json({ error: 'sign_in_required' }); return null; }
    // Check server-owned state each time so revocation and role removal take effect.
    const [user, session] = await Promise.all([client.users.getUser(userId), client.sessions.getSession(sessionId)]);
    if (session.status !== 'active' || session.userId !== userId) { res.status(401).json({ error: 'session_expired' }); return null; }
    const member = memberForUser(user);
    if (!member || (permission && !member.permissions.includes(permission))) {
      res.status(403).json({ error: 'access_not_allowed' }); return null;
    }
    return member;
  } catch {
    res.status(503).json({ error: 'sign_in_unavailable' }); return null;
  }
}
