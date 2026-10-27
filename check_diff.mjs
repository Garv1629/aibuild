import { spawnSync } from 'child_process';

const r1 = spawnSync('git', ['add', 'src/components/Stats.tsx'], { encoding: 'utf-8' });
const r2 = spawnSync('git', ['commit', '-m', 'Add scroll-triggered animation to Stats section'], { encoding: 'utf-8' });
const r3 = spawnSync('git', ['push', 'origin', 'main'], { encoding: 'utf-8' });
const r4 = spawnSync('git', ['status'], { encoding: 'utf-8' });

console.error('=== R1 ===', r1.status, r1.stdout, r1.stderr);
console.error('=== R2 ===', r2.status, r2.stdout, r2.stderr);
console.error('=== R3 ===', r3.status, r3.stdout, r3.stderr);
console.error('=== R4 ===', r4.status, r4.stdout, r4.stderr);
process.exit(1);
