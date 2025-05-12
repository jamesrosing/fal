/**
 * This script migrates from placeholder-based media components to standard next-cloudinary components
 * It replaces UnifiedMedia, Media, and other placeholder-based components with
 * the standard CldImage and CldVideo components from the components/media directory.
 */
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const IMPORT_REGEX = /import\s+{([^}]*)}\s+from\s+(['"])@\/components\/media(['"])/g;
const UNIFIED_MEDIA_REGEX = /<UnifiedMedia\s+([^>]*)\/>/g;
const UNIFIED_MEDIA_REGEX_WITH_CHILDREN = /<UnifiedMedia\s+([^>]*)>([\s\S]*?)<\/UnifiedMedia>/g;
const PLACEHOLDER_PROP_REGEX = /placeholderId=(['"])([^'"]+)(['"])/g;
const MEDIA_REGISTRY_REGEX = /mediaRegistry\.getAsset\((['"])([^'"]+)(['"])\)/g;
const API_FETCH_REGEX = /fetch\(`\/api\/media\/([^`]+)`\)/g;
const API_FETCH_QUERY_REGEX = /fetch\(`\/api\/media\?.*?placeholderId=(['"])([^'"]+)(['"]).*?`\)/g;

// Mapping of placeholder IDs to Cloudinary public IDs (add your mappings here)
// This could also be loaded from a JSON file generated from the database
const placeholderToPublicId = {
  'homepage-hero': 'homepage/hero-image',
  'about-hero': 'about/hero-image',
  'contact-hero': 'contact/hero-image',
  // Add more mappings as needed
};

// Function to scan directories for matching files
async function findFiles(dir, extensions = ['.tsx', '.jsx', '.ts', '.js']) {
  let results = [];
  
  try {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
        const subResults = await findFiles(filePath, extensions);
        results = results.concat(subResults);
      } else if (
        stat.isFile() && 
        extensions.includes(path.extname(file).toLowerCase())
      ) {
        results.push(filePath);
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
  }
  
  return results;
}

// Function to search for imports
async function processImports(filePath, content) {
  let newContent = content;
  
  // Replace media imports with next-cloudinary imports
  const hasMediaImports = IMPORT_REGEX.test(content);
  
  if (hasMediaImports) {
    // Reset regex state
    IMPORT_REGEX.lastIndex = 0;
    
    // Check if we need to add imports
    const hasUnifiedMedia = /<UnifiedMedia/g.test(content);
    
    if (hasUnifiedMedia) {
      newContent = newContent.replace(
        IMPORT_REGEX,
        (match, imports, quote1, quote2) => {
          // If imports already include CldImage or CldVideo, don't add them
          const existingImports = imports.split(',').map(i => i.trim());
          
          // Check if we need to add CldImage or CldVideo
          const needsCldImage = !existingImports.includes('CldImage') && content.includes('UnifiedMedia');
          const needsCldVideo = !existingImports.includes('CldVideo') && (content.includes('type="video"') || content.includes('isVideo'));
          
          const addImports = [];
          
          if (needsCldImage) {
            addImports.push('CldImage');
          }
          
          if (needsCldVideo) {
            addImports.push('CldVideo');
          }
          
          if (addImports.length === 0) {
            return match;
          }
          
          const importStatement = `import { ${addImports.join(', ')}, ${imports.trim()} } from ${quote1}@/components/media${quote2}`;
          return importStatement;
        }
      );
    }
  } else if (/<UnifiedMedia/g.test(content)) {
    // Add import if it doesn't exist
    const hasVideo = content.includes('type="video"') || content.includes('isVideo');
    const importStatement = hasVideo
      ? "import { CldImage, CldVideo } from '@/components/media';\n"
      : "import { CldImage } from '@/components/media';\n";
    
    // Add at the top of the file, but after any 'use client' directive
    if (content.startsWith("'use client'")) {
      newContent = content.replace("'use client'", "'use client';\n\n" + importStatement);
    } else {
      newContent = importStatement + content;
    }
  }
  
  return newContent;
}

// Function to replace UnifiedMedia components
async function processUnifiedMedia(filePath, content) {
  let newContent = content;
  
  // Process UnifiedMedia with self-closing tags
  if (UNIFIED_MEDIA_REGEX.test(content)) {
    // Reset regex state
    UNIFIED_MEDIA_REGEX.lastIndex = 0;
    
    newContent = newContent.replace(
      UNIFIED_MEDIA_REGEX,
      (match, props) => {
        // Check if it's a video
        const isVideo = props.includes('type="video"') || props.includes('isVideo');
        
        // Parse props
        let updatedProps = props;
        
        // Replace placeholderId with publicId
        updatedProps = updatedProps.replace(
          PLACEHOLDER_PROP_REGEX,
          (match, q1, id, q3) => {
            const publicId = placeholderToPublicId[id] || id;
            return `publicId=${q1}${publicId}${q3}`;
          }
        );
        
        // Remove any UnifiedMedia-specific props
        updatedProps = updatedProps
          .replace(/\bisVideo\s*=\s*(['"])(true|false)(['"])/g, '')
          .replace(/\btype\s*=\s*(['"])video(['"])/g, '');
        
        // Convert to appropriate component
        if (isVideo) {
          return `<CldVideo ${updatedProps}/>`;
        } else {
          return `<CldImage ${updatedProps}/>`;
        }
      }
    );
  }
  
  // Process UnifiedMedia with children
  if (UNIFIED_MEDIA_REGEX_WITH_CHILDREN.test(newContent)) {
    // Reset regex state
    UNIFIED_MEDIA_REGEX_WITH_CHILDREN.lastIndex = 0;
    
    newContent = newContent.replace(
      UNIFIED_MEDIA_REGEX_WITH_CHILDREN,
      (match, props, children) => {
        // Check if it's a video
        const isVideo = props.includes('type="video"') || props.includes('isVideo');
        
        // Parse props
        let updatedProps = props;
        
        // Replace placeholderId with publicId
        updatedProps = updatedProps.replace(
          PLACEHOLDER_PROP_REGEX,
          (match, q1, id, q3) => {
            const publicId = placeholderToPublicId[id] || id;
            return `publicId=${q1}${publicId}${q3}`;
          }
        );
        
        // Remove any UnifiedMedia-specific props
        updatedProps = updatedProps
          .replace(/\bisVideo\s*=\s*(['"])(true|false)(['"])/g, '')
          .replace(/\btype\s*=\s*(['"])video(['"])/g, '');
        
        // Convert to appropriate component
        if (isVideo) {
          return `<CldVideo ${updatedProps}>${children}</CldVideo>`;
        } else {
          return `<CldImage ${updatedProps}>${children}</CldImage>`;
        }
      }
    );
  }
  
  return newContent;
}

// Function to process API fetch calls
async function processApiFetch(filePath, content) {
  let newContent = content;
  
  // Replace fetch calls to /api/media/ endpoints
  if (API_FETCH_REGEX.test(content)) {
    // Reset regex state
    API_FETCH_REGEX.lastIndex = 0;
    
    newContent = newContent.replace(
      API_FETCH_REGEX,
      (match, placeholder) => {
        return `fetch(\`/api/cloudinary/asset/\${encodeURIComponent('${placeholder}').replace(/\\//g, '|')}\`)`;
      }
    );
  }
  
  // Replace fetch calls with query params
  if (API_FETCH_QUERY_REGEX.test(newContent)) {
    // Reset regex state
    API_FETCH_QUERY_REGEX.lastIndex = 0;
    
    newContent = newContent.replace(
      API_FETCH_QUERY_REGEX,
      (match, q1, id, q3) => {
        const publicId = placeholderToPublicId[id] || id;
        return `fetch(\`/api/cloudinary/asset/\${encodeURIComponent('${publicId}').replace(/\\//g, '|')}\`)`;
      }
    );
  }
  
  return newContent;
}

// Main function
async function migrateToDirectCloudinary() {
  try {
    const rootDir = process.cwd();
    console.log(`Scanning directory: ${rootDir}`);
    
    // Find all relevant files
    const files = await findFiles(rootDir);
    console.log(`Found ${files.length} files to process`);
    
    // Process each file
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Skip files that don't have any relevant content
        if (!content.includes('UnifiedMedia') && 
            !content.includes('placeholderId') &&
            !content.includes('/api/media/') &&
            !content.includes('mediaRegistry')) {
          continue;
        }
        
        console.log(`Processing: ${filePath}`);
        
        // Process file with all our transformations
        let newContent = await processImports(filePath, content);
        newContent = await processUnifiedMedia(filePath, newContent);
        newContent = await processApiFetch(filePath, newContent);
        
        // Only write file if changes were made
        if (content !== newContent) {
          // Create backup
          await fs.writeFile(`${filePath}.bak`, content, 'utf8');
          
          // Write changed file
          await fs.writeFile(filePath, newContent, 'utf8');
          console.log(`Updated: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
      }
    }
    
    console.log('Migration completed');
  } catch (err) {
    console.error('Error in migration process:', err);
  }
}

// Run the migration
migrateToDirectCloudinary();