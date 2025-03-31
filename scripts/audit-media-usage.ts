// scripts/audit-media-usage.ts
import fs from 'fs';
import path from 'path';
import * as glob from 'glob';

interface MediaUsage {
  filePath: string;
  lineNumber: number;
  pattern: string;
  context: string;
}

// Patterns to look for
const patterns = [
  // Images
  /<img\s/,
  /<Image\s/,
  /src=["']/,
  /import.*from ["'].*\.(jpg|jpeg|png|gif|webp|svg)["']/,
  
  // Videos
  /<video\s/,
  /<ReactPlayer/,
  /<VideoPlayer/,
  /\.(mp4|webm|ogg|mov)/
];

function scanFile(filePath: string): MediaUsage[] {
  console.log(`Scanning file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const usages: MediaUsage[] = [];
  
  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      if (pattern.test(line)) {
        usages.push({
          filePath,
          lineNumber: index + 1,
          pattern: pattern.toString(),
          context: line.trim()
        });
      }
    });
  });
  
  if (usages.length > 0) {
    console.log(`Found ${usages.length} media usages in ${filePath}`);
  }
  
  return usages;
}

async function scanDirectory(directory: string): Promise<MediaUsage[]> {
  console.log(`Scanning directory: ${directory}`);
  const files = glob.sync(`${directory}/**/*.{js,jsx,ts,tsx}`);
  
  console.log(`Found ${files.length} files to scan`);
  
  let allUsages: MediaUsage[] = [];
  
  for (const file of files) {
    const usages = scanFile(file);
    allUsages = [...allUsages, ...usages];
  }
  
  return allUsages;
}

async function main() {
  console.log("Starting media usage scan...");
  
  const directoriesToScan = ['./app', './components'];
  let allUsages: MediaUsage[] = [];
  
  for (const dir of directoriesToScan) {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: ${dir} directory not found, skipping`);
      continue;
    }
    
    console.log(`Scanning directory: ${dir}`);
    const usages = await scanDirectory(dir);
    allUsages = [...allUsages, ...usages];
  }
  
  const outputFile = 'media-audit-results.json';
  fs.writeFileSync(
    outputFile,
    JSON.stringify(allUsages, null, 2)
  );
  
  console.log(`Scan complete! Found ${allUsages.length} media usages in the codebase`);
  console.log(`Results written to ${outputFile}`);
}

main().catch((error) => {
  console.error("Error during execution:", error);
});