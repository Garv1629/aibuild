const { execSync } = require('child_process');
const fs = require('fs');

let log = '';
try {
  log += 'ComSpec: ' + process.env.ComSpec + '\n';
  log += 'PATH: ' + process.env.PATH + '\n';

  const out1 = execSync('git add -A', { shell: 'powershell.exe', encoding: 'utf-8' });
  log += 'out1: ' + out1 + '\n';

  const out2 = execSync('git commit -m "Add scroll-triggered animation to Stats section"', { shell: 'powershell.exe', encoding: 'utf-8' });
  log += 'out2: ' + out2 + '\n';

  const out3 = execSync('git push origin main', { shell: 'powershell.exe', encoding: 'utf-8' });
  log += 'out3: ' + out3 + '\n';
} catch (err) {
  log += 'ERR: ' + (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + err.message + '\n';
}

fs.writeFileSync('C:/Users/GARV/.gemini/antigravity-ide/brain/ee323ddf-7d00-4f90-ad13-e0c27f55f224/git_push_log.txt', log);
