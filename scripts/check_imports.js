const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const issues = [];

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const code = fs.readFileSync(full, 'utf-8');
      
      // Check if useState is used directly (not React.useState)
      const matches = code.match(/(?<!React\.)\buseState\s*(?:<[^>]*>)?\s*\(/g);
      if (matches) {
        // Check if useState is imported from 'react'
        const hasImport = /import\s+[^;]*\buseState\b[^;]*from\s+['"]react['"]/.test(code);
        if (!hasImport) {
          issues.push({ file: full, count: matches.length });
        }
      }
    }
  }
}

scan(srcDir);
fs.writeFileSync(path.join(__dirname, 'results.txt'), JSON.stringify(issues, null, 2));
console.log('Done scanning. Found ' + issues.length + ' issues.');
