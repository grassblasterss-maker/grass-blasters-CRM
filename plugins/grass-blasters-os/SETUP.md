# Grass Blasters OS plugin setup

This package contains the Grass Blasters operating skill. It intentionally does not embed an OpenAI API key and does not require Supabase.

Enable only the Jobber and Zapier Tables actions you need in Zapier MCP, then connect Gmail and Calendar in ChatGPT. Keep customer-facing and financial actions behind the approval rules in the bundled skill.

For a future custom Grass Blasters MCP server, register its remote URL in ChatGPT Developer Mode first, copy the returned `plugin_asdk_app...` technical ID, and then add an `.app.json` mapping to this package. V1 does not require that server because Zapier MCP supplies the Jobber and Tables actions.
