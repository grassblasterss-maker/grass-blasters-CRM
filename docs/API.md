# API reference

## Authentication

`POST /api/zapier/intake` requires `X-Webhook-Secret`. `POST /api/tools/execute` accepts `X-API-Key` or a bearer token matching `GRASS_BLASTERS_API_KEY`. Write tools also require `Idempotency-Key`.

All secrets remain server-side. The status endpoints return configured/not-configured booleans only.

## Event intake

```http
POST /api/zapier/intake
X-Webhook-Secret: <configured secret>
Content-Type: application/json
```

```json
{"source":"jobber","eventType":"quote.sent","entityType":"quote","externalId":"4821","occurredAt":"2026-09-09T14:30:00Z","record":{"clientId":"123","total":15900}}
```

The endpoint creates a stable `eventKey`, adds timestamps, and forwards the event to the configured persistence Zap. The Zap must find/update by `eventKey` to prevent duplicates.

## Tool execution

```http
POST /api/tools/execute
X-API-Key: <configured key>
Idempotency-Key: request-123-patio-20260909
Content-Type: application/json
```

```json
{"tool":"create_jobber_request","arguments":{"clientId":"123","title":"Patio request"},"approval":{"confirmed":true,"approvedBy":"Dominic","confirmation":"Create the patio request shown above"}}
```

The API returns `202 accepted` because the action has been handed to Zapier. Do not display it as completed until Jobber or the AI Action Log confirms the downstream result.

## Risk behavior

| Risk | Behavior |
|---|---|
| Green | Reads, internal tasks/notes, and unsent drafts may be forwarded without a separate approval object. |
| Yellow | Returns `409 approval_required` unless `approval.confirmed` is true. |
| Red | Returns `403 red_tools_disabled` unless the server is explicitly configured to allow red tools; a fresh approval is still required. |
