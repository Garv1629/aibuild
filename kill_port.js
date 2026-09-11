import { execSync } from 'child_process';
try {
  const result = execSync('netstat -ano').toString();
  const line = result.split('\n').find(l => l.includes(':5173') && l.includes('LISTENING'));
  if (line) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    console.log('Killing PID on 5173:', pid);
    execSync(`taskkill /F /PID ${pid}`);
    console.log('Killed successfully!');
  } else {
    console.log('No process listening on 5173.');
  }
} catch (e) {
  console.error('Kill error:', e.message);
}
