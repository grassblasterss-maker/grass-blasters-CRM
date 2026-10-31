# Activate Jarvis 0.4

The code is prepared, but real-account setup and live acceptance tests are required. Existing main/production remains unchanged until this branch is merged and deployed. This adds Clerk as an authentication dependency; it does not provision an account or change billing.

## Owner and assistant sign-in

1. Create or select a Clerk application. Use email sign-in and restricted/invitation-only sign-ups. Add the real Jarvis domain. Configure a production instance for production; do not use test keys with customer data.
2. In Vercel, configure these server environment variables for the correct project/environment:

| Variable | Value |
|---|---|
| CLERK_SECRET_KEY | Secret key from the selected Clerk instance; server only |
| CLERK_PUBLISHABLE_KEY | Publishable key from the same instance |
| JARVIS_APP_ORIGIN | Exact HTTPS origin, currently https://grass-blasters-crm.vercel.app (no path) |
| JARVIS_OWNER_EMAILS | Comma-separated verified owner email addresses |
| JARVIS_ASSISTANT_EMAILS | Comma-separated verified assistant email addresses |

The owner's email and Madeline's email have not been supplied or guessed. Set them directly in Vercel. Keep the owner list limited to owners; users in both lists receive owner access. The API checks the verified primary email, not user-editable metadata. Updating a role list requires a redeploy; revoking a Clerk session is checked on each authenticated request.

3. Invite the intended accounts from Clerk. This implementation does not send invitations automatically.
4. Deploy a preview using its exact origin in the preview environment. Configure Clerk's allowed origins/domain settings accordingly. Do not use a wildcard to trust all vercel.app projects.
5. Verify both roles with real logins and API calls before production. The HTML/assets are public application code; customer records are only served by authenticated endpoints. Hiding a menu is not the security boundary.

## Jobber client-read pilot

The existing ChatGPT/Zapier connection cannot be transferred into deployed JavaScript by assumption. For this first read adapter, create/authorize a Jobber developer app with the minimum client-read scope, then set:

- JOBBER_ACCESS_TOKEN: authorized OAuth access token, server only.
- JOBBER_API_VERSION: an active date-based version tested against the app's schema.

The fixed query requests clients(first:25, after:cursor), nodes { id name }, and pageInfo. It accepts no caller-supplied GraphQL. Invalid/expired tokens return a reconnect state; no sample data is substituted. Refresh-token rotation and durable credential storage are still required for unattended use. Do not present this pilot as a permanent live connection.

After sign-in, load clients, then load another page. Confirm names against Jobber. Test missing scope, expired token and pagination. No customer mutation is performed by the client page.

## Existing automation endpoints

Keep the five existing server variables from SETUP-A-Z.md for Zapier routing/persistence and keep ALLOW_RED_TOOLS=false. Browser users do not receive GRASS_BLASTERS_API_KEY. The existing /api/tools/execute remains a separate trusted-machine path; this release does not connect browser draft actions or assert downstream idempotency/persistence is verified.

/api/integrations/status is now owner-authenticated and takes a Clerk bearer session. /api/auth/config exposes only the publishable key and configured flag; /api/auth/session verifies the member. /api/health still describes legacy Zapier configuration, not user sign-in, actual Jobber connectivity, or full launch readiness.

## Deployment

Repository: grassblasterss-maker/grass-blasters-CRM. Vercel project: grass-blasters-crm. Framework: Other; repository root; no build command; npm dependencies must install from package-lock.json; Node 20 or newer. Node API functions must remain deployed alongside the root HTML. Do not switch to a static-only export that omits functions.

Deploy the reviewed commit after configuring environment variables. Check the production alias maps to that commit. Verify the sign-in screen when signed out, each role after login, the protected client endpoint and the microphone header. Configuration alone does not satisfy these tests.

## Validation and rollback

Run npm ci, npm run check, npm test. npm run dev is a local preview with real API handlers and no auth bypass; without credentials it shows setup-in-progress. SDK calls are mocked in unit tests to verify permission behavior; those tests do not substitute for a real Clerk login or Jobber API test.

Use a verified Vercel deployment rollback if the release fails, remembering the previous version is a public demo UI and should not receive customer records. Never commit credentials, customer records or exported customer worksheets to GitHub.

Official references: https://clerk.com/docs/js-frontend/getting-started/quickstart, https://clerk.com/docs/reference/backend/authenticate-request, https://developer.getjobber.com/docs/using_jobbers_api/api_queries_and_mutations/
