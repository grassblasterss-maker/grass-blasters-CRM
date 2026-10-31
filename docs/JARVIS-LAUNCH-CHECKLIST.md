# Jarvis implementation and launch checklist

Updated October 31, 2026. This supersedes the earlier rollout scope in IMPLEMENTATION.md.

Jarvis is Grass Blasters' oversight, design, estimating, and content workspace. Jobber remains the system of record for customers, properties, jobs, visits, time, quotes, invoices, and payments. Employees stay in Jobber. The owner and assistant use Jarvis. The 2027 revenue target is $800,000; this is a planning target, not a forecast.

## Status vocabulary

- Built: code exists and local checks pass.
- Configured: required production settings exist.
- Verified: a real account completes the workflow successfully in production.
- Blocked/pending: not completed. A successful webhook acceptance is not proof that an action or persistence finished.

## This implementation

- [x] Replace the fictional dashboard with honest empty states and useful tools.
- [x] Implement Clerk email sign-in and verified-email allowlists.
- [x] Enforce owner/assistant permissions on the server; reject shared automation keys as user identity.
- [x] Reject revoked sessions, removed members, unverified emails, and provider failures.
- [x] Restrict connection configuration status to the owner.
- [x] Build paginated Jobber client reads with explicit missing/expired/error states and no sample fallback.
- [x] Build material calculations: volume, area, length, count, waste, supplier increments, compaction factor, labor, delivery, markup and gross margin.
- [x] Export material worksheets as JSON; invalidate old results after input changes.
- [x] Build separate business/personal filming briefs and copyable AI prompts for Facebook, Instagram, TikTok, and YouTube Shorts.
- [x] Add navigation by voice, stop control, and available British browser speech.
- [x] Add the implementation checklist to the owner workspace.
- [ ] Configure and verify Clerk with the actual owner and assistant accounts.
- [ ] Configure and verify live Jobber reads with a scoped token and API version.
- [ ] Release the tested build to production and verify its deployed commit.

## 1. Activate secure access

Follow SECURE-WORKSPACE-SETUP.md. Do not mark this section done merely because the sign-in page displays.

- [ ] Owner can sign in with an invited, verified email.
- [ ] Assistant can sign in and read clients/use design and content tools.
- [ ] Assistant cannot access finance, connections, or owner checklist endpoints.
- [ ] A stranger, unverified account, removed allowlist entry, and revoked session cannot read data.
- [ ] Signed-out page shows sign-in only; failed authentication never opens the workspace.
- [ ] Logout removes visible records; expired sessions prompt a fresh sign-in.

## 2. Jobber integration

Connected action catalog checked October 31: Grass Blasters has a Jobber connection in ChatGPT/Zapier; enabled actions include find/create client, create request, create quote, create job, and event reads. Direct create-invoice action was not present. This does not authenticate the website or prove those actions have been tested here.

- [ ] Store OAuth refresh credentials in durable server-side storage; handle refresh rotation and reconnection. The current access-token read adapter is for initial validation, not unattended authorization.
- [ ] Verify the API version and client-read scopes; load more than 25 records to test pagination.
- [ ] Add jobs, visits, hours, quotes, outstanding invoices, completed work and real record links.
- [ ] Keep finance permissions enforced on every future financial endpoint.
- [ ] Connect a durable activity log and sync status, including last successful sync and retry errors.
- [ ] Configure the existing action/persistence Zaps and their signed webhooks.
- [ ] Resolve ambiguous client names and exact property before creating drafts. Current Zapier quote/job actions use the client's first property; this is not a safe assumption for multi-property clients.
- [ ] Test one reviewed quote with line items; verify saved ID/link and replay prevention.
- [ ] Verify direct draft-invoice capability; if unavailable, document the manual Jobber job-to-invoice step.
- [ ] Confirm retries do not duplicate drafts and repeated updates are not incorrectly discarded.

## 3. Facebook and growth reporting

- [ ] Verify Page, business portfolio, ad account, and permissions.
- [ ] Import lead forms once with service, contact details and source attribution.
- [ ] Read spend, leads and CPL with matching Ads Manager timezone/date filters.
- [ ] Match lead → Jobber request/client → quote → booked job/revenue.
- [ ] Track seasonal targets toward $800,000 without displaying target numbers as actual revenue.

## 4. Voice

- [ ] Verify deployed Permissions-Policy allows microphone=(self), browser permission, and supported phone/desktop browser.
- [ ] Add secure conversational AI and saved background-task progress.
- [ ] Dictate client/property and line items, resolve ambiguity, review/correct/cancel, then save exactly once.
- [ ] Report completion only after Jobber confirms its saved record.
- [ ] Use an original polished British voice; available browser voices are only the initial navigation implementation.
- [ ] Add Alexa/dedicated wake word after the core workflow works.

## 5. Design and estimating

- [ ] Private photo/PDF/plant schedule uploads, shared storage, customer/property associations and revision history.
- [ ] Keep concept renderings clearly separate from measured takeoffs.
- [ ] Add supplier pricing records and combined multi-line estimates.
- [ ] Convert reviewed quantities to a real Jobber quote through the approved action path.
- [ ] Use Eshelman for the first complete measured plan → materials → reviewed Jobber quote test.

Current calculator exports a single material worksheet. No cloud save or automatic measurement is claimed. Supplier factors and coverage must be supplied explicitly. Costs exclude tax and anything not entered.

## 6. Content Studio

- [ ] Private footage upload and shared draft persistence.
- [ ] AI-generated hooks/scripts/shot lists/captions inside Jarvis. Current brief is a template plus a prompt to use in ChatGPT.
- [ ] Calendar for one planned video per day, keeping business/personal identities separate.
- [ ] Verify account and publishing capabilities for each selected platform.
- [ ] Review before scheduling/publishing; unsupported personal profiles use prepared files and manual posting.
- [ ] Confirm platform publication IDs; distinguish planned, scheduled, failed, and published.

## 7. Release and reliability

- [ ] Real-account and phone/desktop end-to-end tests.
- [ ] Expired connections, unavailable APIs, rate limits and interrupted voice tests.
- [ ] Durable shared storage, audit log, backups, and restore verification.
- [ ] Saved work survives logout and deployment. Current calculator/brief exports must be downloaded; unsaved tab data is not durable.
- [ ] Record tested production commit and rollback deployment.
- [ ] Keep messages, invoices, payments and publishing separate from drafting; no external sends without instruction.
