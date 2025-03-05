/**
 * Find Vercel Blob URLs Script
 * 
 * This script scans your entire codebase to find all references to Vercel Blob storage URLs.
 * It will output a structured report that you can use to plan your migration to Cloudinary.
 * 
 * Usage: node scripts/find-vercel-blob-urls.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert fs functions to Promise-based for easier async/await usage
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Regular expression to match Vercel Blob URLs
const VERCEL_BLOB_REGEX = /https:\/\/[a-zA-Z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s)]+/g;

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  'public',
];

// File extensions to scan
const EXTENSIONS_TO_SCAN = [
  '.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.html', '.css', '.scss', '.json'
];

// Store results
const results = [];
let totalUrlsFound = 0;

/**
 * Scans a file for Vercel Blob URLs
 */
async function scanFile(filePath) {
  try {
    // Only scan text files with extensions we care about
    const ext = path.extname(filePath);
    if (!EXTENSIONS_TO_SCAN.includes(ext)) {
      return;
    }
    
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const fileResults = [];
    
    lines.forEach((line, lineIndex) => {
      const matches = line.match(VERCEL_BLOB_REGEX);
      if (matches) {
        matches.forEach(url => {
          fileResults.push({
            lineNumber: lineIndex + 1,
            url,
            line: line.trim()
          });
          totalUrlsFound++;
        });
      }
    });
    
    if (fileResults.length > 0) {
      results.push({
        filePath: filePath,
        matches: fileResults
      });
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Recursively scans directories
 */
async function scanDir(dirPath) {
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      // Skip directories we don't want to scan
      if (SKIP_DIRS.includes(entry)) {
        continue;
      }
      
      const entryPath = path.join(dirPath, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        // Recursively scan subdirectories
        await scanDir(entryPath);
      } else if (entryStat.isFile()) {
        // Scan individual files
        await scanFile(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
}

/**
 * Extracts the filename from a Vercel Blob URL
 */
function extractFilenameFromUrl(url) {
  // Get the part after the last slash
  const fullName = url.split('/').pop();
  
  // Handle URLs with hash or query parameters
  const baseName = fullName.split(/[?#]/)[0];
  
  // Extract just the filename without the unique ID suffix
  // Format is usually: filename-UniqueIDSuffix.ext
  const match = baseName.match(/(.+)-[A-Za-z0-9]{22,}\.(webp|jpg|jpeg|png|gif|svg)/);
  if (match) {
    return match[1] + '.' + match[2];
  }
  
  return baseName;
}

/**
 * Outputs results in a structured format
 */
function outputResults() {
  console.log(`\n=== Vercel Blob URL Report ===\n`);
  console.log(`Found ${totalUrlsFound} Vercel Blob URLs in ${results.length} files\n`);
  
  // Group URLs by filename
  const urlsByFilename = {};
  
  results.forEach(fileResult => {
    console.log(`\nFile: ${fileResult.filePath}`);
    console.log('-'.repeat(fileResult.filePath.length + 6));
    
    fileResult.matches.forEach(match => {
      console.log(`Line ${match.lineNumber}: ${match.url}`);
      
      // Extract the filename for grouping
      const filename = extractFilenameFromUrl(match.url);
      if (!urlsByFilename[filename]) {
        urlsByFilename[filename] = [];
      }
      urlsByFilename[filename].push({
        url: match.url,
        filePath: fileResult.filePath,
        lineNumber: match.lineNumber
      });
    });
  });
  
  // Output migration plan with Cloudinary equivalents
  console.log(`\n\n=== Migration Plan to Cloudinary ===\n`);
  
  Object.keys(urlsByFilename).sort().forEach(filename => {
    const instances = urlsByFilename[filename];
    const cloudinaryId = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log(`\n${filename} (${instances.length} instances):`);
    console.log('-'.repeat(filename.length + instances.length.toString().length + 13));
    
    console.log(`Cloudinary Public ID suggestion: "${cloudinaryId}"`);
    console.log(`Cloudinary URL: https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w'}/image/upload/f_auto,q_auto/${cloudinaryId}`);
    
    console.log(`\nReferences to replace:`);
    instances.forEach(instance => {
      console.log(`- ${instance.filePath}:${instance.lineNumber}`);
    });
  });
  
  // Create a summary of file types to replace
  console.log(`\n\n=== File Types Summary ===\n`);
  const fileTypes = {};
  
  results.forEach(fileResult => {
    const ext = path.extname(fileResult.filePath);
    if (!fileTypes[ext]) {
      fileTypes[ext] = { count: 0, files: [] };
    }
    fileTypes[ext].count += fileResult.matches.length;
    fileTypes[ext].files.push(fileResult.filePath);
  });
  
  Object.keys(fileTypes).sort().forEach(ext => {
    console.log(`${ext}: ${fileTypes[ext].count} URLs in ${fileTypes[ext].files.length} files`);
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Scanning for Vercel Blob URLs...');
  
  // Start scan from the current directory
  await scanDir(process.cwd());
  
  // Output the results
  outputResults();
  
  // Generate a migration script suggestion
  console.log(`\n\n=== Next Steps ===\n`);
  console.log(`1. Upload all identified images to Cloudinary using the suggested public IDs`);
  console.log(`2. Use the CloudinaryImage component to replace the Vercel Blob URLs:`);
  console.log(`
  // Before:
  <img src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png" />
  
  // After:
  <CloudinaryImage
    publicId="example_image"
    alt="Example image"
    width={800}
    height={600}
    options={{
      crop: 'fill',
      gravity: 'center'
    }}
  />
  `);
  
  console.log(`3. For non-component image URLs, use the Cloudinary URL structure:`);
  console.log(`
  // Before:
  "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png"
  
  // After:
  "https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/example_image"
  `);
  
  console.log(`4. Run this script again after making changes to verify all URLs have been replaced`);
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
}); 