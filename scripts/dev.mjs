// Local preview only; no mock identities or production authentication bypass.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = process.cwd();
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 3000);
const routes = { '/api/auth/config': '../api/auth/config.js', '/api/auth/session': '../api/auth/session.js', '/api/jobber/clients': '../api/jobber/clients.js', '/api/integrations/status': '../api/integrations/status.js', '/api/health': '../api/health.js' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (routes[url.pathname]) {
    req.query = Object.fromEntries(url.searchParams); res.status = code => { res.statusCode = code; return res; }; res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
    try { await (await import(routes[url.pathname])).default(req, res); } catch { res.statusCode = 500; res.end('Request failed'); } return;
  }
  if (req.method !== 'GET') { res.statusCode = 405; res.end(); return; }
  const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (name !== 'index.html' && !/^assets\/[a-zA-Z0-9.-]+\.(css|js)$/.test(name)) { res.statusCode = 404; res.end(); return; }
  try { const body = await readFile(resolve(root, name)); res.setHeader('Content-Type', { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[extname(name)]); res.end(body); } catch { res.statusCode = 404; res.end(); }
}).listen(port, '0.0.0.0', () => console.log('Jarvis preview server ready'));
