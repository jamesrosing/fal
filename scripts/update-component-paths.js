// Script to update component references to use full Cloudinary paths
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Path mappings to standardize (old prefixes to new format)
const pathMappings = {
  // Convert old-style references to new full paths
  'plastic-surgery/': 'fal/pages/services/plastic-surgery/',
  'services/plastic-surgery/': 'fal/pages/services/plastic-surgery/',
  'page:services/plastic-surgery/': 'fal/pages/services/plastic-surgery/',
  'component:': 'fal/components/'
};

// File patterns to search for component references
const filePatterns = [
  'app/**/*.tsx',
  'app/**/*.jsx',
  'components/**/*.tsx',
  'components/**/*.jsx'
];

async function updateComponentReferences() {
  console.log('🔍 Finding files with component references...');

  // Find all matching files
  const files = [];
  filePatterns.forEach(pattern => {
    const matches = globSync(path.join(projectRoot, pattern));
    files.push(...matches);
  });

  console.log(`Found ${files.length} files to check`);
  let totalReplacements = 0;

  // Process each file
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let fileReplacements = 0;
    let newContent = content;

    // Find CloudinaryImage or CloudinaryVideo component usages with id prop
    const componentRegex = /<(CloudinaryImage|CloudinaryVideo|OptimizedImage|OptimizedVideo)[^>]*id=["']([^"']+)["'][^>]*>/g;
    
    // Track replacements for this file
    const replacements = [];
    
    let match;
    while (match = componentRegex.exec(content)) {
      const [fullMatch, componentName, idValue] = match;
      let needsReplacement = false;
      let newIdValue = idValue;
      
      // Check if this path needs to be updated
      for (const [oldPrefix, newPrefix] of Object.entries(pathMappings)) {
        if (idValue.startsWith(oldPrefix)) {
          // Replace old prefix with new prefix
          newIdValue = idValue.replace(oldPrefix, newPrefix);
          needsReplacement = true;
          break;
        }
      }
      
      // Also handle direct absolute paths that need the fal/ prefix
      if (!needsReplacement && !idValue.startsWith('fal/') && !idValue.startsWith('http')) {
        if (idValue.match(/^(pages|services|components)/)) {
          newIdValue = `fal/${idValue}`;
          needsReplacement = true;
        }
      }
      
      if (needsReplacement) {
        replacements.push({
          original: idValue,
          replacement: newIdValue,
          start: match.index,
          end: match.index + fullMatch.length
        });
      }
    }
    
    // Apply replacements in reverse order to avoid index issues
    if (replacements.length > 0) {
      // Sort replacements from last to first in the file
      replacements.sort((a, b) => b.start - a.start);
      
      for (const replacement of replacements) {
        const beforeReplacement = newContent.substring(0, replacement.start);
        const afterReplacement = newContent.substring(replacement.start);
        
        // Replace id="oldValue" with id="newValue"
        newContent = beforeReplacement + 
                     afterReplacement.replace(`id="${replacement.original}"`, `id="${replacement.replacement}"`);
        
        fileReplacements++;
      }
      
      // Write the updated content back to the file
      if (fileReplacements > 0) {
        fs.writeFileSync(file, newContent);
        console.log(`✅ Updated ${fileReplacements} references in ${file}`);
        totalReplacements += fileReplacements;
      }
    }
  }
  
  console.log(`\n✨ Component path update complete!`);
  console.log(`Updated ${totalReplacements} component references across ${files.length} files.`);
}

// Run the update
updateComponentReferences()
  .catch(error => console.error('Update failed:', error)); 