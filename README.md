# Grass Blasters OS

Grass Blasters OS is a lightweight operating layer around Jobber. V0.3 uses ChatGPT plus a private company plugin for reasoning, Zapier MCP for interactive Jobber/Tables actions, and Zaps for background automation. It does not require Supabase or an OpenAI API key.

## Included

- Static V2 dashboard.
- Secure Vercel API routes for event intake, tool execution, health, and configuration status.
- Green/yellow/red action policy with idempotency requirements.
- Portable Grass Blasters plugin and operating skill.
- Four Zapier Tables CSV templates.
- Node test suite with no third-party packages.

## Validate

```sh
npm run check
npm test
```

## Configure

Start with [docs/SETUP-A-Z.md](docs/SETUP-A-Z.md), then use [docs/API.md](docs/API.md) for webhook payloads and responses.

## Live website

[Open Grass Blasters Jarvis](https://grass-blasters-crm.vercel.app/). Website availability was verified October 29, 2026; Jobber integration remains unconfigured. See [deployment status and remaining setup](docs/DEPLOYMENT-STATUS.md) for the verified checks and exact next steps.
