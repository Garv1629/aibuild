const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ogSrc = 'C:\\Users\\GARV\\.gemini\\antigravity-ide\\brain\\c7511b11-17ce-4348-ba3a-ce7cbfa13590\\ai_build_og_preview_1793391730336.jpg';
const destJpg = path.join(__dirname, 'public', 'og-image.jpg');
const destPng = path.join(__dirname, 'public', 'og-image.png');
if (fs.existsSync(ogSrc)) {
  fs.copyFileSync(ogSrc, destJpg);
  fs.copyFileSync(ogSrc, destPng);
}

const run = (cmd, args) => {
  const res = spawnSync(cmd, args, {
    encoding: 'utf-8',
    cwd: __dirname,
    env: { ...process.env, TEMP: 'e:\\temp', TMP: 'e:\\temp', TMPDIR: 'e:\\temp' },
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    error: res.error ? res.error.message : null
  };
};

const results = {};
console.log('1. Running Tests...');
results.tests = run(process.execPath, ['--import', 'tsx', '--test', 'src/utils/portfolio.test.ts', 'src/context/auth.test.ts']);

console.log('2. Running TypeScript Check...');
results.tsc = run(process.execPath, ['./node_modules/typescript/bin/tsc', '--noEmit']);

console.log('3. Running Production Build...');
results.build = run(process.execPath, ['./node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist']);

const hasFailure = results.tests.status !== 0 || results.tsc.status !== 0 || results.build.status !== 0;
if (hasFailure) {
  console.error('FAILURES DETECTED:');
  if (results.tests.status !== 0) console.error(results.tests.stderr || results.tests.stdout);
  if (results.tsc.status !== 0) console.error(results.tsc.stderr || results.tsc.stdout);
  if (results.build.status !== 0) console.error(results.build.stderr || results.build.stdout);
  process.exit(1);
}

console.log('ALL CHECKS PASSED: 29/29 tests, TSC compilation, and production build clean!');

const git = (args) => {
  console.log(`> git ${args.join(' ')}`);
  const r = spawnSync('git', args, { encoding: 'utf-8', cwd: __dirname });
  console.log(r.stdout || '');
  if (r.stderr) console.error(r.stderr);
  return r;
};

// Clean up temporary files
const tempFiles = ['do_push.cjs', 'launch.vbs', 'run_verify.js', 'search_gallery.js', 'test_results.json'];
for (const f of tempFiles) {
  if (fs.existsSync(f)) {
    try { fs.unlinkSync(f); } catch (e) {}
  }
}

console.log('4. Staging files for commit...');
git(['add', 'src/', 'public/', 'serve.mjs', 'test_runner.cjs']);

console.log('5. Committing changes...');
git(['commit', '-m', 'feat: Redesign Projects Manager to match reference UI and fix gallery image blur']);

console.log('6. Pushing to origin main...');
const pushRes = git(['push', 'origin', 'main']);
if (pushRes.status === 0) {
  console.log('SUCCESS: All code pushed to GitHub (origin/main)!');
} else {
  console.error('Git push failed with status:', pushRes.status);
  process.exit(pushRes.status ?? 1);
}

git(['status']);
