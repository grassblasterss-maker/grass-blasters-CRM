# Deployment status and remaining setup

Verified October 29, 2026 (America/New_York).

## Public website

https://grass-blasters-crm.vercel.app/

The homepage returned HTTP 200 and rendered the Jarvis AI Command Center. Its HTML matched the repository's dashboard. This verifies a working public website; the Vercel production target, deployed commit, and deployment history could not be confirmed through the connected account: project discovery succeeded, but project details returned 404 and deployment listing returned 403. No Vercel CLI is installed in the task environment.

## API configuration at verification

GET /api/health returned 503, mode configuration_required.
GET /api/integrations/status returned 200. inboundWebhook, actionWebhook, tablesIntakeWebhook, outboundSigning, and protectedToolApi were all false. redToolsEnabled was false.

The API functions are deployed, but the integration is not configured. A successful health check only establishes configuration presence, not a working Jobber connection.

## Exact remaining Vercel steps

1. Open team grassblasterss-9553s-projects, project grass-blasters-crm.
2. Confirm Settings > Git connects grassblasterss-maker/grass-blasters-CRM and production branch main.
3. For this static HTML plus Node API project, use Framework Preset Other, repository root as Root Directory, no build command, and root output (default for Other). Do not choose a static-only output directory that excludes the API functions. Use a supported Node version matching package.json.
4. In Settings > Environment Variables, set the following for Production. Enter secrets directly in Vercel, never in GitHub or chat:
   - ZAPIER_WEBHOOK_SECRET: shared inbound secret used by the sender of /api/zapier/intake.
   - ZAPIER_ACTION_WEBHOOK_URL: real Catch Raw Hook URL from the published GB — API action router Zap.
   - ZAPIER_TABLES_INTAKE_WEBHOOK_URL: real Catch Raw Hook URL from the published GB — Event persistence Zap.
   - ZAPIER_OUTBOUND_SIGNING_SECRET: signing secret whose HMAC signature the receiving Zaps verify.
   - GRASS_BLASTERS_API_KEY: private key used by trusted callers of /api/tools/execute.
   - ALLOW_RED_TOOLS: false.
5. Deploy the latest main commit to Production after saving variables. Existing deployments do not acquire new environment values automatically. Confirm the public domain is assigned to that deployment.
6. Recheck /api/health for 200 and /api/integrations/status for all five configuration booleans true, with redToolsEnabled false.

## Jobber is a separate completion milestone

Follow docs/SETUP-A-Z.md to create the four Zapier Tables and publish the router/persistence Zaps. Test a real event, verify its persisted row, replay it to verify deduplication, and verify the approved action flow and red-action block.

The dashboard currently contains fictional static records and mock actions. Its only fetch is integration status; it does not fetch Jobber clients, schedules, invoices, or operating-state rows. Setting Vercel variables alone will not turn those cards into live data. A protected read API and dashboard wiring are additional development work for live records. The chat box directs users to ChatGPT; it is not an embedded live AI backend.

Before displaying real customer records on this currently public site, implement authenticated access and authorization. Never put the shared API key into browser JavaScript.

## Repository fixes from this check

- Require inbound secret and outbound signing in dashboard readiness.
- Require outbound signing in the health check, with a regression test.
- Allow microphone access for the same origin so the existing Jarvis voice control is not blocked by Permissions-Policy; browser permission and browser speech-recognition support still apply.
