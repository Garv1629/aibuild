const { execSync } = require('child_process');
try {
  const out = execSync('netstat -ano').toString();
  const lines = out.split('\n').filter(l => l.includes('5173') || l.includes('5174'));
  console.log('Ports 5173/5174:\n', lines.join('\n'));
} catch (e) {
  console.error(e.message);
}
