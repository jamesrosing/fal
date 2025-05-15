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

// Regex patterns for prop fixes
const propFixes = [
  // Fix id to src
  {
    pattern: /<CldImage\s+([^>]*?)id={([^}]+?)}([^>]*?)>/g,
    replacement: (match, before, idValue, after) => {
      return `<CldImage ${before}src={${idValue}}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  },
  // Fix publicId to src
  {
    pattern: /<CldImage\s+([^>]*?)publicId={([^}]+?)}([^>]*?)>/g,
    replacement: (match, before, idValue, after) => {
      return `<CldImage ${before}src={${idValue}}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  },
  // Add config to CldImage if missing
  {
    pattern: /<CldImage\s+([^>]*?)(?!config=)([^>]*?)>/g,
    replacement: (match, before, after) => {
      if (match.includes('config=')) return match; // Skip if config already exists
      return `<CldImage ${before}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  },
  // Fix id to src in CldVideo
  {
    pattern: /<CldVideo\s+([^>]*?)id={([^}]+?)}([^>]*?)>/g,
    replacement: (match, before, idValue, after) => {
      return `<CldVideo ${before}src={${idValue}}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  },
  // Fix publicId to src in CldVideo
  {
    pattern: /<CldVideo\s+([^>]*?)publicId={([^}]+?)}([^>]*?)>/g,
    replacement: (match, before, idValue, after) => {
      return `<CldVideo ${before}src={${idValue}}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  },
  // Add config to CldVideo if missing
  {
    pattern: /<CldVideo\s+([^>]*?)(?!config=)([^>]*?)>/g,
    replacement: (match, before, after) => {
      if (match.includes('config=')) return match; // Skip if config already exists
      return `<CldVideo ${before}${after} config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>`;
    }
  }
];

// Process a file to fix props
async function processFile(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    let modified = false;
    
    for (const fix of propFixes) {
      if (fix.pattern.test(content)) {
        const originalContent = content;
        content = content.replace(fix.pattern, fix.replacement);
        if (content !== originalContent) {
          modified = true;
        }
      }
    }
    
    if (modified) {
      await writeFileAsync(filePath, content, 'utf8');
      console.log(`Fixed props in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function to fix all props
async function fixProps(startDir = '.') {
  try {
    console.log('Scanning for files to fix...');
    const files = await findFiles(startDir);
    
    console.log(`Found ${files.length} .tsx files to process`);
    
    // Process all files in parallel
    await Promise.all(files.map(file => processFile(file)));
    
    console.log('Prop fixing completed!');
  } catch (error) {
    console.error('Error fixing props:', error);
  }
}

// Run the fix function
fixProps(); 