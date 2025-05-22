const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing mismatched quotes in imports...\n');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  cwd: 'D:/fal',
  absolute: true,
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/backup/**',
    '**/.git/**',
    '**/scripts/**'
  ]
});

let fixedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix mismatched quotes in import statements
    // Pattern: starts with single quote but ends with double quote
    const regex = /from\s+['"]([^'"]+)["']/g;
    
    const fixedContent = content.replace(regex, (match, importPath) => {
      // Check if the quotes are mismatched
      if ((match.includes("from '") && match.endsWith('"')) || 
          (match.includes('from "') && match.endsWith("'"))) {
        modified = true;
        // Use single quotes consistently
        return `from '${importPath}'`;
      }
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(file, fixedContent, 'utf8');
      console.log(`✅ Fixed quotes in: ${path.relative('D:/fal', file)}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✨ Fixed quotes in ${fixedCount} files`);
