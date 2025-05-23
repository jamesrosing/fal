import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ES module URL to filepath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify functions
const readFileAsync = fs.promises.readFile;
const writeFileAsync = fs.promises.writeFile;
const readdirAsync = fs.promises.readdir;
const statAsync = fs.promises.stat;

// Find all files recursively in a directory
async function findFiles(dir, fileType = '.tsx') {
  const files = [];
  
  async function scan(directory) {
    const entries = await readdirAsync(directory);
    
    for (const entry of entries) {
      // Skip node_modules and .next directories
      if (entry === 'node_modules' || entry === '.next' || entry === 'backup') {
        continue;
      }
      
      const fullPath = path.join(directory, entry);
      const stat = await statAsync(fullPath);
      
      if (stat.isDirectory()) {
        await scan(fullPath);
      } else if (entry.endsWith(fileType)) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

// Regex patterns for incorrect imports
const patterns = [
  {
    match: /import\s*{\s*CldImage\s*}\s*from\s*['"]\.\.\/components\/media\/CldImage['"]/g,
    replace: `import CldImage from '@/components/shared/media/CldImage'`
  },
  {
    match: /import\s*{\s*CldVideo\s*}\s*from\s*['"]\.\.\/components\/media\/CldVideo['"]/g,
    replace: `import CldVideo from '@/components/shared/media/CldVideo'`
  }
];

// Process a file to fix imports
async function processFile(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    let modified = false;
    
    for (const pattern of patterns) {
      if (pattern.match.test(content)) {
        content = content.replace(pattern.match, pattern.replace);
        modified = true;
      }
    }
    
    if (modified) {
      await writeFileAsync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function to fix all imports
async function fixImports(startDir = '.') {
  try {
    console.log('Scanning for files to fix...');
    const files = await findFiles(startDir);
    
    console.log(`Found ${files.length} .tsx files to process`);
    
    // Process all files in parallel
    await Promise.all(files.map(file => processFile(file)));
    
    console.log('Import fixing completed!');
  } catch (error) {
    console.error('Error fixing imports:', error);
  }
}

// Run the fix function
fixImports(); 