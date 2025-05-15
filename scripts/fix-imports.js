// This script fixes CldImage and CldVideo imports to use absolute paths with @ alias
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all files that might have the incorrect imports
const filePaths = await glob([
  './app/**/*.{ts,tsx,js,jsx}',
  './components/**/*.{ts,tsx,js,jsx}',
  '!./node_modules/**',
  '!./backup/**',
  '!./scripts/**',
], { nodir: true });

const relativeImportRegexes = [
  /import\s+{\s*CldImage\s*}\s+from\s+['"]\.\.\/components\/media\/CldImage['"]/g,
  /import\s+{\s*CldVideo\s*}\s+from\s+['"]\.\.\/components\/media\/CldVideo['"]/g
];

const replacements = [
  'import CldImage from \'@/components/media/CldImage\'',
  'import CldVideo from \'@/components/media/CldVideo\''
];

let totalFilesUpdated = 0;
let totalImportsUpdated = 0;

for (const filePath of filePaths) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileImportsUpdated = 0;

    relativeImportRegexes.forEach((regex, index) => {
      const matches = content.match(regex);
      if (matches) {
        fileImportsUpdated += matches.length;
        content = content.replace(regex, replacements[index]);
      }
    });

    if (fileImportsUpdated > 0) {
      fs.writeFileSync(filePath, content);
      totalFilesUpdated++;
      totalImportsUpdated += fileImportsUpdated;
      console.log(`Updated ${fileImportsUpdated} imports in ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

console.log(`\nSummary:`);
console.log(`Total files updated: ${totalFilesUpdated}`);
console.log(`Total imports updated: ${totalImportsUpdated}`);