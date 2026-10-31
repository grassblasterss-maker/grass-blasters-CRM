# Grass Blasters Jarvis

Jarvis is an oversight and planning workspace around Jobber. Jobber remains responsible for operational records, time tracking, invoicing, and payments.

Version 0.4 includes owner/assistant email access via Clerk, server-enforced permissions, a protected paginated Jobber client-read pilot, a materials worksheet, a content filming-brief/prompt builder, browser voice navigation, and an implementation checklist. No sample business totals or simulated successful actions are displayed.

## Validate

```sh
npm ci
npm run check
npm test
npm run dev
```

## Activate

Follow [secure workspace setup](docs/SECURE-WORKSPACE-SETUP.md) and the [master launch checklist](docs/JARVIS-LAUNCH-CHECKLIST.md). Authentication and live integrations require production configuration and real-account tests. No accounts, paid services, invitations, or customer sends are provisioned automatically.

The material worksheet and content brief are download-only, not cloud-saved. Content AI generation, social publishing, Jobber draft creation from the browser, persistent OAuth refresh, private uploads, and live financial reporting remain pending.

## Existing deployment

[Open Jarvis](https://grass-blasters-crm.vercel.app/). On October 31, 2026 the public site returned HTTP 200 but still served the older demo UI; integration settings were missing. Vercel project listing worked, while project/deployment details returned permission errors. This branch must be configured, tested and deployed before these changes are live.

The legacy webhook/action adapter remains available for trusted automation callers. See [API documentation](docs/API.md) and [Zapier setup](docs/SETUP-A-Z.md). A ChatGPT-connected service is separate from the website's runtime credentials.
