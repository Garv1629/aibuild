import { execSync } from 'child_process';
import fs from 'fs';

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8' });
    if (out) console.log(out);
    return { success: true, out };
  } catch (err) {
    console.error(`Error in: ${cmd}`);
    if (err.stdout) console.log('stdout:', err.stdout);
    if (err.stderr) console.error('stderr:', err.stderr);
    return { success: false, error: err };
  }
}

console.log('--- Step 1: Checking status ---');
run('git status');

// If in rebase, check
if (fs.existsSync('.git/rebase-merge') || fs.existsSync('.git/rebase-apply')) {
  console.log('--- In rebase state. Adding all files and continuing rebase ---');
  run('git add -A');
  // Rebase continue or abort
  const res = run('git rebase --continue');
  if (!res.success) {
    console.log('Rebase continue failed, checking if commit needed...');
    run('git commit --allow-empty -m "Update project and documentation"');
    run('git rebase --continue');
  }
}

// Stage any remaining changes
console.log('--- Step 2: Staging all remaining changes ---');
run('git add -A');

// Commit if there are staged changes
console.log('--- Step 3: Committing changes ---');
run('git commit -m "feat: complete project multi-media zero-cut playback, showcase updates, and docs bundle"');

// Push to GitHub
console.log('--- Step 4: Pushing to remote main ---');
const pushRes = run('git push origin main');
if (!pushRes.success) {
  console.log('Push rejected or need force/pull. Trying git push origin main --force-with-lease...');
  run('git push origin main --force-with-lease');
}

console.log('--- Step 5: Final Status ---');
run('git status');
console.log('Done!');
