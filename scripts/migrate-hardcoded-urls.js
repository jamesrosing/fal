import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { createRequire } from 'module';

// Use createRequire to import JSON
const require = createRequire(import.meta.url);
const replacementMap = require('../cloudinary-replacement-map.json');

// Convert URLs to IDs for the replacement map
const urlToIdMap = {};
Object.entries(replacementMap).forEach(([url, data]) => {
  // Extract an ID from the publicId
  const parts = data.publicId.split('/');
  let id = parts[parts.length - 1];
  
  // Clean up the ID to be a valid JavaScript identifier
  id = id.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  
  // Make sure we don't have duplicate IDs
  if (urlToIdMap[url]) {
    console.warn(`Warning: Duplicate URL mapping for ${url}`);
  } else {
    urlToIdMap[url] = id;
  }
});

function replaceHardcodedUrls(content) {
  let newContent = content;
  let modified = false;
  
  // Replace hardcoded Cloudinary URLs with OptimizedImage components
  Object.entries(urlToIdMap).forEach(([url, id]) => {
    if (newContent.includes(url)) {
      // Look for patterns like src="url"
      const srcPattern = new RegExp(`src=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
      if (srcPattern.test(newContent)) {
        newContent = newContent.replace(srcPattern, `id="${id}"`);
        modified = true;
        
        // Also replace Image with OptimizedImage if not already done
        if (!newContent.includes('OptimizedImage') && newContent.includes('<Image')) {
          newContent = newContent.replace(/<Image/g, '<OptimizedImage');
          newContent = newContent.replace(/<\/Image>/g, '</OptimizedImage>');
        }
      }
    }
  });
  
  return { content: newContent, modified };
}

function addImports(content) {
  // Skip if already has imports
  if (content.includes('OptimizedImage')) {
    return content;
  }
  
  // Find the last import
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  const lastImportIndex = importLines.length ? 
    content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length : 
    0;
  
  const newImports = `
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';
`;
  
  return content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
}

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hardcoded URLs
    const { content: newContent, modified } = replaceHardcodedUrls(content);
    
    // Only update if changes were made
    if (modified) {
      // Add imports if needed
      const finalContent = addImports(newContent);
      
      // Write the file
      fs.writeFileSync(filePath, finalContent);
      console.log(`✅ Updated ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Find all React files
    const appFiles = await glob('./app/**/*.{tsx,jsx}');
    const componentFiles = await glob('./components/**/*.{tsx,jsx}');
    
    const allFiles = [...appFiles, ...componentFiles];
    
    console.log(`Found ${allFiles.length} files to process`);
    console.log(`URL to ID map contains ${Object.keys(urlToIdMap).length} mappings`);
    
    let updated = 0;
    
    // Process each file
    for (const file of allFiles) {
      const result = await processFile(file);
      if (result) updated++;
    }
    
    console.log(`\nMigration Summary:`);
    console.log(`Total files: ${allFiles.length}`);
    console.log(`Updated files: ${updated}`);
    
    if (updated > 0) {
      console.log(`\nNext steps:`);
      console.log(`1. Run verification script to check all media assets`);
      console.log(`2. Test the application to ensure all media loads correctly`);
      console.log(`3. Check for any remaining hardcoded URLs`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();