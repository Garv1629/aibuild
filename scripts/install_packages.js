import { execSync } from 'child_process';

try {
  console.log('Installing dependencies...');
  execSync('npm install express cors pg dotenv better-sqlite3', { stdio: 'inherit', shell: true });
  console.log('Dependencies installed successfully!');
} catch (err) {
  console.error('Install error:', err);
}
