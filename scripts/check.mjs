import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
function check(dir) { for (const file of readdirSync(dir, { withFileTypes: true })) { const path = `${dir}/${file.name}`; if (file.isDirectory()) check(path); else if (/\.m?js$/.test(path)) { const r = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); } } }
for (const dir of ['api', 'lib', 'assets', 'scripts', 'test']) check(dir);
console.log('JavaScript syntax checks passed.');
