import { methodNotAllowed } from '../../lib/http.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return res.status(200).json({
    version: '0.3.0',
    architecture: 'chatgpt-plugin-zapier-mcp',
    integrations: {
      inboundWebhook: Boolean(process.env.ZAPIER_WEBHOOK_SECRET),
      actionWebhook: Boolean(process.env.ZAPIER_ACTION_WEBHOOK_URL),
      tablesIntakeWebhook: Boolean(process.env.ZAPIER_TABLES_INTAKE_WEBHOOK_URL),
      outboundSigning: Boolean(process.env.ZAPIER_OUTBOUND_SIGNING_SECRET),
      protectedToolApi: Boolean(process.env.GRASS_BLASTERS_API_KEY),
      redToolsEnabled: process.env.ALLOW_RED_TOOLS === 'true'
    },
    intentionallyNotRequired: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']
  });
}
