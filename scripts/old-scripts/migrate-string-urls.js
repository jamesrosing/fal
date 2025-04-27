import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Patterns to search for
const patterns = [
  {
    name: 'Cloudinary URL in object property',
    regex: /(\s*)(image|logo|src|url|poster):\s*["']https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^"']+["']/g,
    transform: (match) => {
      // Extract the URL
      const urlMatch = match.match(/["'](https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^"']+)["']/);
      if (!urlMatch) return match;
      
      const url = urlMatch[1];
      
      // Extract the public ID (everything after upload/)
      const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (!publicIdMatch) return match;
      
      const publicId = publicIdMatch[1];
      
      // Create a proper ID
      const id = publicId
        .replace(/\.\w+$/, '') // Remove file extension
        .replace(/[\/\.]/g, '/'); // Replace dots with slashes
      
      // Rebuild the property with a media ID reference
      return match.replace(
        /["']https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^"']+["']/,
        `mediaId("${id}")`
      );
    }
  },
  {
    name: 'Img tag with Cloudinary URL',
    regex: /<img\s+([^>]*?)src=["'](https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^"']+)["']([^>]*?)>/g,
    transform: (match, beforeSrc, url, afterSrc) => {
      // Extract the public ID (everything after upload/)
      const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (!publicIdMatch) return match;
      
      const publicId = publicIdMatch[1];
      
      // Create a proper ID
      const id = publicId
        .replace(/\.\w+$/, '') // Remove file extension
        .replace(/[\/\.]/g, '/'); // Replace dots with slashes
      
      // Extract alt text if present
      const altMatch = match.match(/alt=["']([^"']*)["']/);
      const alt = altMatch ? altMatch[1] : '';
      
      // Build the new component
      return `<OptimizedImage id="${id}" alt="${alt}" />`;
    }
  },
  {
    name: 'Template literal with Cloudinary URL',
    regex: /\`https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^\`]+\`/g,
    transform: (match) => {
      // Extract the URL template
      const url = match.slice(1, -1); // Remove backticks
      
      // Check if it contains dynamic parts
      if (url.includes('${')) {
        // For dynamic URLs, create a function call
        return `getMediaUrl("${url.replace(/\${([^}]+)}/g, '{$1}')}")`;
      } else {
        // For static URLs, extract the public ID
        const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (!publicIdMatch) return match;
        
        const publicId = publicIdMatch[1];
        
        // Create a proper ID
        const id = publicId
          .replace(/\.\w+$/, '') // Remove file extension
          .replace(/[\/\.]/g, '/'); // Replace dots with slashes
        
        return `mediaUrl("${id}")`;
      }
    }
  }
];

function addImports(content) {
  // Check if already has imports
  const needsOptimizedImage = content.includes('<OptimizedImage') && !content.includes('import OptimizedImage');
  const needsMediaHelpers = (content.includes('mediaId(') || content.includes('mediaUrl(') || content.includes('getMediaUrl(')) && 
                         !content.includes('import { mediaId') && !content.includes('from "@/lib/media"');
  
  if (!needsOptimizedImage && !needsMediaHelpers) {
    return content;
  }
  
  // Find the last import
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  const lastImportIndex = importLines.length ? 
    content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length : 
    0;
  
  let newImports = '';
  
  if (needsOptimizedImage) {
    newImports += `\nimport OptimizedImage from '@/components/media/OptimizedImage';`;
  }
  
  if (needsMediaHelpers) {
    newImports += `\nimport { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";`;
  }
  
  newImports += '\n';
  
  return content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
}

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;
    
    // Apply each pattern
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex); // Create a new instance to reset lastIndex
      let match;
      
      // Reset regex state
      regex.lastIndex = 0;
      
      // Test if pattern exists before processing
      if (regex.test(newContent)) {
        // Reset for actual replacement
        regex.lastIndex = 0;
        
        // Reset the content to start fresh
        const contentBeforeThisPattern = newContent;
        
        // Apply the transformation
        if (pattern.name === 'Img tag with Cloudinary URL') {
          newContent = newContent.replace(regex, (match, beforeSrc, url, afterSrc) => {
            return pattern.transform(match, beforeSrc, url, afterSrc);
          });
        } else {
          newContent = newContent.replace(regex, (match) => {
            return pattern.transform(match);
          });
        }
        
        // Check if changes were made
        if (contentBeforeThisPattern !== newContent) {
          console.log(`  Applied pattern: ${pattern.name}`);
          modified = true;
        }
      }
    }
    
    // Only update if changes were made
    if (modified) {
      // Add necessary imports
      newContent = addImports(newContent);
      
      // Write the file
      fs.writeFileSync(filePath, newContent);
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
    const appPattern = path.resolve('./app', '**/*.{tsx,jsx}').replace(/\\/g, '/');
    const componentsPattern = path.resolve('./components', '**/*.{tsx,jsx}').replace(/\\/g, '/');
    
    const appFiles = await glob(appPattern);
    const componentFiles = await glob(componentsPattern);
    
    const allFiles = [...appFiles, ...componentFiles];
    
    console.log(`Found ${allFiles.length} files to process`);
    
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