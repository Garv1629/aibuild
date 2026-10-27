const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let out = '';
const log = (...args) => {
  const line = args.join(' ');
  out += line + '\n';
  console.log(line);
};

const statusRes = spawnSync('git', ['status'], { encoding: 'utf-8' });
log('Git Status:\n' + statusRes.stdout + (statusRes.stderr || ''));

fs.writeFileSync(path.join(__dirname, 'rebase_status.txt'), out);
