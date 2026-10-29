import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let log = '';
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: __dirname, encoding: 'utf-8' });
  log += `> ${cmd} ${args.join(' ')}\n` + (r.stdout || '') + (r.stderr || '') + '\n';
};

run('git', ['add', '.']);
run('git', ['commit', '-m', 'Add official studio email aibuild2026@gmail.com under hero CTAs and in footer']);
run('git', ['push', 'origin', 'main']);
run('git', ['status']);
fs.writeFileSync(path.join(__dirname, 'git_output.json'), JSON.stringify({ log }, null, 2));
console.log('SYNC_COMPLETE');
