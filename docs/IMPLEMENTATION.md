# Grass Blasters OS — V0.3 architecture

## Product rule

Jobber remains the source of truth for field-service records. ChatGPT is the reasoning and conversation layer. The private Grass Blasters plugin supplies company workflows and safety rules. Zapier MCP supplies interactive Jobber and Zapier Tables actions. Zaps handle events that must run without a chat open.

Supabase/Postgres and an OpenAI API key are intentionally not required for V1.

## System split

| Layer | Product | Responsibility |
|---|---|---|
| AI | ChatGPT subscription | Reasoning, conversation, orchestration |
| Company brain | Grass Blasters plugin | Owner brief, sales, operations, collections, approvals |
| Interactive actions | Zapier MCP | Jobber and Zapier Tables tools |
| Business records | Jobber | Clients, requests, quotes, jobs, visits, invoices |
| Lightweight state | Zapier Tables | Queue, opportunities, automation state, AI action log, settings |
| Background events | Zapier Zaps | New leads, quote timers, job-close and invoice workflows |
| Dashboard/API | Vercel | Visual status, secure intake and approved action gateway |

## API contract

- `GET /api/health` reports whether required server configuration is present.
- `GET /api/integrations/status` reports booleans only and never returns secrets.
- `GET /api/tools/manifest` lists approved business tools and their risk levels.
- `POST /api/tools/execute` sends an authorized, idempotent action envelope to Zapier.
- `POST /api/zapier/intake` authenticates and normalizes Jobber/Facebook events before sending them to the Zapier Tables persistence Zap.

Both write paths fail closed if their secrets or webhook URLs are missing. Yellow actions require explicit confirmation. Red actions are disabled by default.

## Source-of-truth rule

Do not copy complete client, property, quote, job, visit, invoice, or payment records into another database. Store Jobber IDs in lightweight operating records and retrieve live details from Jobber when needed.

## Next external configuration

Follow [SETUP-A-Z.md](SETUP-A-Z.md). The remaining blockers are account-owned connections and webhook URLs, not missing application code.
