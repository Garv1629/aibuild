import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync('git', ['status', '--short'], { cwd: __dirname, encoding: 'utf-8' });
fs.writeFileSync(path.join(__dirname, 'git_status.txt'), r.stdout || r.stderr || 'CLEAN');
console.log('DONE');
