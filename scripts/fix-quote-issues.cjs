const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix quote mismatches and remove BOM
function fixQuoteIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;

    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.substring(1);
      hasChanges = true;
      console.log(`Removed BOM from: ${filePath}`);
    }

    // Fix mismatched quotes in import statements line by line
    const lines = content.split('\n');
    const fixedLines = lines.map((line, index) => {
      if (line.includes('import') && line.includes('from')) {
        // Look for patterns like: from 'something" or from "something'
        const fixedLine = line.replace(/from\s+(['"])([^'"]+)(['"]);?/g, (match, startQuote, modulePath, endQuote) => {
          if (startQuote !== endQuote) {
            hasChanges = true;
            console.log(`Fixed mismatched quotes in ${filePath}:${index + 1}`);
            return `from '${modulePath}'${match.endsWith(';') ? ';' : ''}`;
          }
          return match;
        });
        return fixedLine;
      }
      return line;
    });

    if (hasChanges) {
      content = fixedLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }

  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main function
async function main() {
  console.log('Fixing quote issues and BOM characters...\n');

  // Get the project root directory (parent of scripts directory)
  const projectRoot = path.resolve(__dirname, '..');
  console.log(`Project root: ${projectRoot}\n`);

  const patterns = [
    'app/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'hooks/**/*.{ts,tsx,js,jsx}',
    'styles/**/*.{ts,tsx,js,jsx,css,scss}'
  ];

  let totalFiles = 0;
  let fixedFiles = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern, { 
      cwd: projectRoot,
      absolute: true,
      nodir: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']
    });

    console.log(`Found ${files.length} files matching pattern: ${pattern}`);

    for (const file of files) {
      const beforeSize = fs.statSync(file).size;
      fixQuoteIssues(file);
      const afterSize = fs.statSync(file).size;
      
      if (beforeSize !== afterSize) {
        fixedFiles++;
      }
      totalFiles++;
    }
  }

  console.log(`\nProcessed ${totalFiles} files.`);
  console.log(`Fixed ${fixedFiles} files.`);
}

// Run the script
main().catch(console.error);
