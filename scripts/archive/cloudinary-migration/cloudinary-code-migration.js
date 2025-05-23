import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = process.cwd();
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');
const PLACEHOLDER_COMPONENTS = [
  'UnifiedImage',
  'UnifiedVideo',
  'OptimizedImage',
  'OptimizedVideo',
  'ServerImage',
  'MediaRenderer',
  'CloudinaryMedia'
];

// Load placeholder to publicId mapping
const MAPPING_FILE = path.join(PROJECT_ROOT, 'cloudinary-replacement-map.json');
let placeholderMap = {};

try {
  if (fs.existsSync(MAPPING_FILE)) {
    placeholderMap = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(placeholderMap).length} placeholder mappings`);
  } else {
    console.warn('Warning: No placeholder mapping file found at:', MAPPING_FILE);
    console.warn('Please run migrate-media-to-cloudinary.js first');
  }
} catch (error) {
  console.error('Error loading placeholder map:', error);
}

// Function to find and replace placeholders with Cloudinary components
async function migrateCodeToCloudinary() {
  console.log('Starting code migration to Cloudinary components...');
  
  try {
    // 1. Find all files that might use placeholder components
    console.log('Searching for files using placeholder components...');
    
    let filePaths = [];
    
    // Windows-compatible execution with PowerShell
    try {
      const command = `powershell -Command "Get-ChildItem -Path . -Recurse -Include *.tsx,*.jsx,*.ts,*.js | Select-String -Pattern '${PLACEHOLDER_COMPONENTS.join('|')}|placeholderId' | ForEach-Object { $_.Path } | Sort-Object -Unique"`;
      const output = execSync(command, { encoding: 'utf8' });
      filePaths = Array.from(new Set(output.split(/\r?\n/).filter(Boolean)));
    } catch (error) {
      console.warn('PowerShell search failed, falling back to glob pattern search:', error);
      
      // Fallback to manual glob search
      const tsxFiles = glob.sync('**/*.{tsx,jsx,ts,js}', {
        ignore: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/backup/**', '**/*.d.ts'],
        cwd: PROJECT_ROOT,
        absolute: true
      });
      
      // Filter files that likely contain placeholder components
      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (PLACEHOLDER_COMPONENTS.some(comp => content.includes(comp)) || content.includes('placeholderId')) {
          filePaths.push(file);
        }
      }
    }
    
    console.log(`Found ${filePaths.length} files that may need migration`);
    
    // 2. Update imports and component usage in each file
    let modifiedFiles = 0;
    
    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) continue;
      
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // 2a. Update imports
      PLACEHOLDER_COMPONENTS.forEach(comp => {
        const imageImportRegex = new RegExp(`import\\s+{?(\\s*${comp}\\s*,?\\s*)}?\\s+from\\s+["']@/components/[\\w/-]+["']`, 'g');
        content = content.replace(imageImportRegex, (match) => {
          if (match.includes('UnifiedImage') || match.includes('OptimizedImage') || match.includes('ServerImage')) {
            return `import { CldImage } from '../components/media/CldImage'`;
          } else if (match.includes('UnifiedVideo') || match.includes('OptimizedVideo')) {
            return `import { CldVideo } from '../components/media/CldVideo'`;
          } else {
            return match; // Keep other imports unchanged
          }
        });
        
        // Handle combined imports
        if (content.includes('CldImage') && content.includes('CldVideo')) {
          const combinedRegex = /import\s+{\s*CldImage\s*}\s+from\s+['"]@\/components\/media\/CldImage['"]\s*;\s*import\s+{\s*CldVideo\s*}\s+from\s+['"]@\/components\/media\/CldVideo['"]/g;
          content = content.replace(combinedRegex, `import { CldImage } from '../components/media/CldImage';\nimport { CldVideo } from '../components/media/CldVideo'`);
        }
      });
      
      // 2b. Replace component usage (UnifiedImage → CldImage, placeholderId → publicId)
      PLACEHOLDER_COMPONENTS.forEach(comp => {
        if (['UnifiedImage', 'OptimizedImage', 'ServerImage', 'MediaRenderer'].includes(comp)) {
          const componentRegex = new RegExp(`<${comp}\\s+([^>]*)placeholderId=["']([^"']+)["']([^>]*)>`, 'g');
          content = content.replace(componentRegex, (match, before, id, after) => {
            const publicId = placeholderMap[id] || id;
            let newProps = before + after;
            
            // Add publicId prop
            newProps = newProps + ` publicId="${publicId}"`;
            
            // Remove legacy props
            newProps = newProps.replace(/\s+placeholderId=["'][^"']+["']/g, '');
            newProps = newProps.replace(/\s+legacy={[^}]+}/g, '');
            
            return `<CldImage ${newProps}>`;
          });
        }
        
        if (['UnifiedVideo', 'OptimizedVideo'].includes(comp)) {
          const componentRegex = new RegExp(`<${comp}\\s+([^>]*)placeholderId=["']([^"']+)["']([^>]*)>`, 'g');
          content = content.replace(componentRegex, (match, before, id, after) => {
            const publicId = placeholderMap[id] || id;
            let newProps = before + after;
            
            // Add publicId prop
            newProps = newProps + ` publicId="${publicId}"`;
            
            // Remove legacy props
            newProps = newProps.replace(/\s+placeholderId=["'][^"']+["']/g, '');
            newProps = newProps.replace(/\s+legacy={[^}]+}/g, '');
            
            return `<CldVideo ${newProps}>`;
          });
        }
      });
      
      // Save changes if content was modified
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated file: ${path.relative(PROJECT_ROOT, filePath)}`);
        modifiedFiles++;
      }
    }
    
    console.log(`\nMigration complete! Modified ${modifiedFiles} files.`);
    
    // Generate list of files that still contain placeholderId for manual review
    console.log('\nChecking for any remaining placeholderId references...');
    
    let remainingPlaceholders = [];
    
    try {
      const command = `powershell -Command "Get-ChildItem -Path . -Recurse -Include *.tsx,*.jsx,*.ts,*.js | Select-String -Pattern 'placeholderId' | ForEach-Object { $_.Path } | Sort-Object -Unique"`;
      const output = execSync(command, { encoding: 'utf8' });
      remainingPlaceholders = output.split(/\r?\n/).filter(Boolean);
    } catch (error) {
      console.warn('PowerShell search failed for remaining placeholders:', error);
    }
    
    if (remainingPlaceholders.length > 0) {
      console.log(`\nWARNING: Found ${remainingPlaceholders.length} files that still contain 'placeholderId' references:`);
      remainingPlaceholders.forEach(file => console.log(`- ${file}`));
      console.log('\nThese may need manual review and updates.');
    } else {
      console.log('\nNo remaining placeholderId references found. Migration appears complete!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Self-executing function
(async () => {
  try {
    await migrateCodeToCloudinary();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})(); 