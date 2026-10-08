import { execSync } from 'child_process';
import fs from 'fs';

console.log('Node:', process.version);
console.log('PATH:', process.env.PATH);

// Find powershell
const pwshPath = 'powershell.exe';

try {
  const npmVersion = execSync('npm --version', { shell: pwshPath, encoding: 'utf-8' });
  console.log('NPM Version:', npmVersion.trim());

  console.log('Running npm install express cors pg dotenv...');
  const res = execSync('npm install express cors pg dotenv', { shell: pwshPath, encoding: 'utf-8' });
  console.log('Installed successfully:', res);
} catch (e) {
  console.error('Error:', e.message);
}
