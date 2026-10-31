export const checklist = [
  ['Secure access', [
    ['Email sign-in and server permissions', 'Built · verify live', 'Clerk sessions, verified-email allowlist, owner and assistant roles. Configure keys, emails, and exact app origin, then test both accounts.'],
    ['Invite-only account setup', 'Needs setup', 'Enable restricted sign-ups and create owner/assistant invitations in Clerk. No employee time-tracking accounts needed here.'],
    ['Production release', 'Blocked', 'Vercel project details and deployment listing returned access errors. The public site serves an older build.']
  ]],
  ['Jobber oversight', [
    ['Paginated live client read endpoint', 'Built · verify live', 'Protected server-side read, real fetched-at timestamp, cursor pagination, and explicit error states. Requires a scoped Jobber token and tested API version.'],
    ['Durable authorization and reporting', 'Pending', 'OAuth refresh storage, jobs/visits, hours, quotes, invoices, and source links. No replacement for Jobber time tracking or payments.'],
    ['Reviewed draft actions', 'Pending', 'Verify exact client/property, line items, deduplication, saved record ID, and activity history. Existing Zapier quotes/jobs target the first property; do not assume that is the intended property.'],
    ['Direct draft invoices', 'Unverified', 'No direct create-invoice action was found among the enabled Jobber actions. Verify API support; otherwise document the remaining job-to-invoice step.']
  ]],
  ['Facebook and growth', [
    ['Lead intake and ad reporting', 'Needs setup', 'Confirm Page, business portfolio, ad account, permissions, date ranges, timezone, and lead deduplication.'],
    ['Lead → quote → booked revenue', 'Pending', 'Match source records reliably and test one full lead journey. $800,000 is the 2027 target, not a revenue forecast.']
  ]],
  ['Voice', [
    ['Navigation and spoken replies', 'Built · verify live', 'Browser microphone with stop control and an available British voice. Requires browser permission/support; no wake word or AI actions yet.'],
    ['Spoken request → saved draft', 'Pending', 'Secure AI backend, line-item extraction, review/correction, cancellation, idempotency, and service-confirmed results.'],
    ['Alexa / dedicated wake word', 'Later', 'Add after the core command system is verified.']
  ]],
  ['Landscape design and estimating', [
    ['Materials worksheet', 'Built · verify live', 'Bulk volume, area, linear length, plant counts, supplier order increments, waste, labor, delivery, markup/margin, and downloadable JSON.'],
    ['Eshelman design workspace', 'Pending', 'Private photo/PDF storage, measured inputs, revisions, plant schedule, shared persistence, illustrative renderings, and draft quote handoff.']
  ]],
  ['Content Studio', [
    ['Filming brief and AI prompt', 'Built · verify live', 'Separate business/personal briefs for Facebook, Instagram, TikTok, and YouTube Shorts. Downloadable; no automatic posting.'],
    ['AI generation and media storage', 'Needs setup', 'Configure a server-side model, private uploads, shared draft storage, scripts, captions, and revisions.'],
    ['Review, scheduling, publication', 'Pending', 'Verify each platform/account capability. Keep planned, scheduled, and published distinct; unsupported personal accounts use manual posting.']
  ]],
  ['Release verification', [
    ['Real-account acceptance tests', 'Pending', 'Owner vs assistant permissions; expired sessions; customer lookup; no duplicate draft; invalid API token; mobile; microphone; saved work after logout.'],
    ['Persistence, audit and recovery', 'Pending', 'Shared storage, backups, job progress, API retries, audit records, and rollback. No secrets or customer records in the repository.']
  ]]
];
