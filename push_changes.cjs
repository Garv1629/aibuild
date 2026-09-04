const { execSync } = require('child_process');

console.log('--- STARTING GITHUB COMMIT & DEPLOYMENT ---');
try {
  console.log('1. Staging files...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('2. Committing changes...');
  try {
    execSync('git commit -m "Update What We Do manager and media uploaders"', { stdio: 'inherit' });
  } catch (e) {
    console.log('Commit notice:', e.message);
  }

  console.log('3. Pushing to GitHub main branch...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('4. Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });

  console.log('SUCCESS! DEPLOYED TO GITHUB & GITHUB PAGES!');
} catch (err) {
  console.error('Error during git execution:', err.message);
}
