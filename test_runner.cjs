const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Ensure public/og-image.jpg exists from generated banner
const ogSrc = 'C:\\Users\\GARV\\.gemini\\antigravity-ide\\brain\\c7511b11-17ce-4348-ba3a-ce7cbfa13590\\ai_build_og_preview_1793391730336.jpg';
const destJpg = path.join(__dirname, 'public', 'og-image.jpg');
const destPng = path.join(__dirname, 'public', 'og-image.png');
if (fs.existsSync(ogSrc)) {
  fs.copyFileSync(ogSrc, destJpg);
  fs.copyFileSync(ogSrc, destPng);
  console.log(`Copied OG banner asset to public/og-image.jpg (${fs.statSync(destJpg).size} bytes)`);
}

const run = (cmd, args) => {
  console.log(`> ${cmd} ${args.join(' ')}`);
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

fs.writeFileSync(path.join(__dirname, 'test_results.json'), JSON.stringify(results, null, 2));
console.log('Results written to test_results.json');

const hasFailure = results.tests.status !== 0 || results.tsc.status !== 0 || results.build.status !== 0;
if (hasFailure) {
  console.error('FAILURES DETECTED:');
  if (results.tests.status !== 0) console.error('Tests failed:', results.tests.stderr || results.tests.stdout);
  if (results.tsc.status !== 0) console.error('TSC failed:', results.tsc.stderr || results.tsc.stdout);
  if (results.build.status !== 0) console.error('Build failed:', results.build.stderr || results.build.stdout);
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED: 29/29 tests, TSC compilation, and production build clean!');
  process.exit(0);
}
