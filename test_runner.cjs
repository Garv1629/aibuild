const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let out = '';
const log = (...args) => {
  const line = args.join(' ');
  out += line + '\n';
  console.log(line);
};

const run = (cmd, args) => {
  log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { encoding: 'utf-8', cwd: __dirname });
  if (res.stdout) log(res.stdout);
  if (res.stderr) log(res.stderr);
  if (res.error) log('Error: ' + res.error.message);
  return res.status === 0;
};

run('git', ['add', '.']);
run('git', ['commit', '-m', 'Add official email aibuild2026@gmail.com under hero buttons and footer']);
run('git', ['push', 'origin', 'main']);
run('git', ['status']);

fs.writeFileSync(path.join(__dirname, 'rebase_status.txt'), out);
