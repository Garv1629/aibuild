const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n');
      
      const hasUseStateCall = content.match(/\buseState\s*(?:<[^>]*>)?\s*\(/);
      const hasReactUseState = content.includes('React.useState');
      const hasImport = content.match(/import\s+[^;]*\buseState\b[^;]*from\s+['"]react['"]/);

      if (hasUseStateCall && !hasImport) {
        console.log(`[MISSING IMPORT] ${full}`);
        lines.forEach((l, idx) => {
          if (l.match(/\buseState\s*(?:<[^>]*>)?\s*\(/) && !l.includes('React.useState')) {
            console.log(`   Line ${idx + 1}: ${l.trim()}`);
          }
        });
      }
    }
  }
}

console.log('--- SCANNING FOR MISSING USESTATE IMPORTS ---');
checkDir(path.join(__dirname, '..', 'src'));
console.log('--- DONE ---');
