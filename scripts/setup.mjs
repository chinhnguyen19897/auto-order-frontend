import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const file = resolve(root, '.env.local');
try { await access(file); console.log('Frontend .env.local exists; kept unchanged.'); }
catch { await writeFile(file, await readFile(resolve(root, '.env.example')), { mode: 0o600 }); console.log('Created frontend .env.local.'); }
