# Grass Blasters OS — setup A–Z

This is the V1 setup path. It avoids Supabase and OpenAI API billing.

## A. ChatGPT workspace

Keep building on the current plan until the plugin is ready to install. When write-capable plugin/MCP testing is required, use a ChatGPT workspace that exposes Developer Mode and the required write tools. Do not merge the personal workspace during initial testing.

## B. Zapier Tables

Create four tables from the CSV templates in `zapier-tables/`: `GB Work Queue`, `GB Automation State`, `GB AI Action Log`, and `GB Settings`.

Use `external_key` as the unique lookup value wherever the template includes it. Before creating a row, find it by `external_key`; update the existing row when found. This is the idempotency rule.

## C. Zapier MCP

Connect the existing Jobber account and Zapier Tables account. Enable the smallest useful action set.

Read tools: Jobber client search plus available quote, job, schedule, and invoice searches; Zapier Tables find/list for all four GB tables.

Green writes: Zapier Tables create/update Work Queue and AI Action Log records; Gmail draft only.

Yellow writes: Jobber Find or Create Client, Create Request, Add Note to Request, Create Quote, and Create Job; Gmail/SMS send.

Do not expose refund, deletion, pricing change, job cancellation, invoice send, or bulk-message actions during the first production phase.

## D. Background Zaps

Create these in order:

1. `GB — API action router`: Catch Raw Hook → verify signature/secret → route by `tool.name` → Jobber/Tables/Gmail action → write AI Action Log.
2. `GB — Event persistence`: Catch Raw Hook → find `external_key = eventKey` → create or update Work Queue/Automation State.
3. `GB — Facebook lead intake`: Facebook Lead Ads → normalize phone/email → find/create Jobber client → create Jobber request → create Work Queue item with 15-minute due time.
4. `GB — Quote follow-up`: Jobber quote sent → create/update Automation State → delay 3 days → check for approval/reply → create Work Queue item.
5. `GB — Job closed`: Jobber job closed → create “ready to invoice” Work Queue item.
6. `GB — Invoice overdue`: scheduled daily → find overdue invoices → create/update collections Work Queue items.

The first two Zaps provide webhook URLs used by Vercel.

## E. Vercel environment variables

Copy `.env.example` names into the Vercel project and enter the real values there: `ZAPIER_WEBHOOK_SECRET`, `ZAPIER_ACTION_WEBHOOK_URL`, `ZAPIER_TABLES_INTAKE_WEBHOOK_URL`, `ZAPIER_OUTBOUND_SIGNING_SECRET`, `GRASS_BLASTERS_API_KEY`, and `ALLOW_RED_TOOLS=false`.

Never put the values in GitHub, this document, browser JavaScript, or ChatGPT messages.

## F. Endpoint tests

1. `GET /api/health` must return `200` and `mode: zapier_ready`.
2. `GET /api/integrations/status` must show all required booleans as `true` and red tools as `false`.
3. Send one test Jobber event to `POST /api/zapier/intake` with `X-Webhook-Secret`.
4. Confirm exactly one matching row exists in Zapier Tables.
5. Send the same event again and confirm the existing row updates instead of duplicating.
6. Call a green tool through `/api/tools/execute` with `X-API-Key` and `Idempotency-Key`.
7. Confirm a yellow tool returns `approval_required` without approval.
8. Confirm a red tool returns `red_tools_disabled` even with approval.

## G. Plugin install and test

The portable plugin is in `plugins/grass-blasters-os/`. Install it in a test-capable ChatGPT/Codex plugin environment alongside Zapier, Gmail, and Calendar.

Run these prompts in a fresh chat:

- “Give me the Grass Blasters owner brief.”
- “Handle today's sales follow-ups.”
- “Find Sarah Miller, but do not create anything.”
- “Create a request for Sarah Miller.” The plugin must show the proposed action and ask for confirmation.
- “Refund this customer.” The plugin must prepare a review and refuse normal execution.

## H. Production acceptance

V1 is live only when a real Jobber event creates or updates one operating-state row; ChatGPT can read current Jobber and GB Table data; a green internal task can be verified; a yellow action pauses for approval and completes once; red actions remain disabled; and the dashboard reports configured integrations without exposing credentials.
