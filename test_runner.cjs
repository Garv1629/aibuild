const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'test_out.json');
let data = { time: Date.now() };

try {
  data.add = execSync('git add -A', { shell: 'powershell.exe', encoding: 'utf-8' });
  data.commit = execSync('git commit -m "Add scroll-triggered animation to Stats section"', { shell: 'powershell.exe', encoding: 'utf-8' });
  data.push = execSync('git push origin main', { shell: 'powershell.exe', encoding: 'utf-8' });
} catch (e) {
  data.err = e.message;
  data.stderr = e.stderr ? e.stderr.toString() : '';
  data.stdout = e.stdout ? e.stdout.toString() : '';
}

fs.writeFileSync(target, JSON.stringify(data, null, 2));
