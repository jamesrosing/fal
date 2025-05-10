import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get current directory 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pattern to match nested import syntax error - more flexible version
const importErrorPattern = /import\s*\{\s*\n\s*import\s+\{[^}]*\}\s*from\s*['"][^'"]*['"];\s*\n/g;

// Process each matched file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the error pattern
    if (importErrorPattern.test(content)) {
      // Fix the import syntax by removing the nested import statements
      const fixedContent = content.replace(importErrorPattern, 'import {');
      
      // Write the fixed content back to the file
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed syntax error in ${filePath}`);
      return true;
    } else {
      console.log(`No syntax errors found in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Find all TypeScript/JavaScript files in components directory
const componentsDir = path.join(__dirname, '..', 'components');
const files = globSync(`${componentsDir}/**/*.{ts,tsx,js,jsx}`);

console.log(`Found ${files.length} files to check...`);

let fixedCount = 0;
// Process each file
files.forEach(file => {
  const wasFixed = processFile(file);
  if (wasFixed) fixedCount++;
});

console.log(`Fixed import errors in ${fixedCount} files.`); 