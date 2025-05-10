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
    console.log(`Loaded ${Object.keys(placeholderMap).length} placeholder mappings from ${MAPPING_FILE}`);
  } else {
    console.error(`Mapping file not found: ${MAPPING_FILE}`);
    console.log('Please run the media migration script first to generate the mapping file.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error loading placeholder mapping file:', error);
  process.exit(1);
}

async function findFilesWithPlaceholders() {
  // Find all TSX and JSX files that use placeholder components
  const componentsPattern = PLACEHOLDER_COMPONENTS.join('|');
  const grepPattern = `import.*(?:${componentsPattern}).*from|<(?:${componentsPattern})`;
  
  console.log(`Searching for files using placeholder components: ${componentsPattern}`);
  
  try {
    const grepCommand = `grep -r "${grepPattern}" --include="*.tsx" --include="*.jsx" --include="*.ts" ${COMPONENTS_DIR}`;
    const result = execSync(grepCommand).toString();
    
    // Extract file paths from grep results
    const filePaths = Array.from(new Set(
      result.split('\n')
        .filter(Boolean)
        .map(line => line.split(':')[0])
    ));
    
    console.log(`Found ${filePaths.length} files with placeholder component imports or usage`);
    return filePaths;
  } catch (error) {
    console.error('Error searching for files with placeholders:', error);
    return [];
  }
}

async function findFilesWithPlaceholderId() {
  // Find all TSX and JSX files that use placeholderId prop
  const grepPattern = 'placeholderId=';
  
  console.log(`Searching for files using placeholderId prop: ${grepPattern}`);
  
  try {
    const grepCommand = `grep -r "${grepPattern}" --include="*.tsx" --include="*.jsx" ${COMPONENTS_DIR}`;
    const result = execSync(grepCommand).toString();
    
    // Extract file paths from grep results
    const filePaths = Array.from(new Set(
      result.split('\n')
        .filter(Boolean)
        .map(line => line.split(':')[0])
    ));
    
    console.log(`Found ${filePaths.length} files with placeholderId props`);
    return filePaths;
  } catch (error) {
    console.error('Error searching for files with placeholderId:', error);
    return [];
  }
}

function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Count placeholder component imports
  const importMatches = content.match(
    new RegExp(`import.*(?:${PLACEHOLDER_COMPONENTS.join('|')}).*from`, 'g')
  ) || [];
  
  // Count placeholderId props
  const propsMatches = content.match(/placeholderId=[\{|\"|\']/g) || [];
  
  return {
    imports: importMatches.length,
    placeholderProps: propsMatches.length,
    hasImports: importMatches.length > 0,
    hasPlaceholderProps: propsMatches.length > 0,
    content
  };
}

function replaceImports(content) {
  // Replace imports of placeholder components with CldImage/CldVideo
  let newContent = content;
  
  // Replace UnifiedImage/OptimizedImage imports with CldImage
  newContent = newContent.replace(
    /import\s+(?:{[^}]*}|\w+)\s+from\s+['"](?:@\/components\/media|\.\/|\.\.\/\S+)\/(?:UnifiedImage|OptimizedImage|ServerImage)['"]/g,
    `import CldImage from '@/components/media/CldImage'`
  );
  
  // Replace UnifiedVideo/OptimizedVideo imports with CldVideo
  newContent = newContent.replace(
    /import\s+(?:{[^}]*}|\w+)\s+from\s+['"](?:@\/components\/media|\.\/|\.\.\/\S+)\/(?:UnifiedVideo|OptimizedVideo)['"]/g,
    `import CldVideo from '@/components/media/CldVideo'`
  );
  
  return newContent;
}

function convertPlaceholderProps(content) {
  let newContent = content;
  
  // Replace static placeholderId props with publicId
  Object.entries(placeholderMap).forEach(([placeholder, publicId]) => {
    // Replace placeholderId="placeholder" with publicId="cloudinary/id"
    const staticRegex = new RegExp(`placeholderId=["']${placeholder}["']`, 'g');
    newContent = newContent.replace(staticRegex, `publicId="${publicId}"`);
    
    // Replace placeholderId={"placeholder"} with publicId="cloudinary/id"
    const jsxRegex = new RegExp(`placeholderId=\\{["']${placeholder}["']\\}`, 'g');
    newContent = newContent.replace(jsxRegex, `publicId="${publicId}"`);
  });
  
  // Add MIGRATION TODO comments for dynamic placeholderId props
  const dynamicPropsRegex = /placeholderId=\{(?!["|'])[^}]+\}/g;
  const matches = newContent.match(dynamicPropsRegex) || [];
  
  if (matches.length > 0) {
    // Add a migration comment at the top of the file
    newContent = `// TODO: CLOUDINARY MIGRATION - This file contains dynamic placeholderId props that need manual migration\n${newContent}`;
    
    // Add comments next to each dynamic prop
    matches.forEach(match => {
      const commentedMatch = `${match} {/* TODO: CLOUDINARY MIGRATION - Convert to publicId */}`;
      newContent = newContent.replace(match, commentedMatch);
    });
  }
  
  return newContent;
}

async function migrateComponent(filePath) {
  try {
    const analysis = analyzeComponent(filePath);
    
    // Skip if no imports or placeholderProps found
    if (!analysis.hasImports && !analysis.hasPlaceholderProps) {
      console.log(`Skipping ${filePath} - No relevant imports or props found`);
      return false;
    }
    
    console.log(`Migrating ${filePath} - ${analysis.imports} imports, ${analysis.placeholderProps} placeholderProps`);
    
    // Create backup of original file
    const backupPath = `${filePath}.bak`;
    fs.writeFileSync(backupPath, analysis.content);
    
    // Apply transformations
    let newContent = analysis.content;
    
    if (analysis.hasImports) {
      newContent = replaceImports(newContent);
    }
    
    if (analysis.hasPlaceholderProps) {
      newContent = convertPlaceholderProps(newContent);
    }
    
    // Convert component tags
    PLACEHOLDER_COMPONENTS.forEach(component => {
      if (component.includes('Image') || component === 'ServerImage') {
        // Convert image components to CldImage
        const componentRegex = new RegExp(`<${component}\\s`, 'g');
        newContent = newContent.replace(componentRegex, '<CldImage ');
        
        const closingRegex = new RegExp(`</${component}>`, 'g');
        newContent = newContent.replace(closingRegex, '</CldImage>');
      } else if (component.includes('Video')) {
        // Convert video components to CldVideo
        const componentRegex = new RegExp(`<${component}\\s`, 'g');
        newContent = newContent.replace(componentRegex, '<CldVideo ');
        
        const closingRegex = new RegExp(`</${component}>`, 'g');
        newContent = newContent.replace(closingRegex, '</CldVideo>');
      }
    });
    
    // Write the modified file if changes were made
    if (newContent !== analysis.content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Successfully migrated ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ No changes made to ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error migrating ${filePath}:`, error);
    return false;
  }
}

async function cleanupLegacyComponents() {
  const filesToDelete = [
    path.join(COMPONENTS_DIR, 'media/UnifiedImage.tsx'),
    path.join(COMPONENTS_DIR, 'media/OptimizedImage.tsx'),
    path.join(COMPONENTS_DIR, 'media/OptimizedVideo.tsx'),
    path.join(COMPONENTS_DIR, 'media/ServerImage.tsx'),
    path.join(COMPONENTS_DIR, 'media/MediaRenderer.tsx'),
    path.join(COMPONENTS_DIR, 'media/CloudinaryMedia.tsx'),
    path.join(PROJECT_ROOT, 'lib/services/media-service.ts'),
    path.join(PROJECT_ROOT, 'lib/media/registry.ts'),
    path.join(PROJECT_ROOT, 'lib/image-config.js')
  ];
  
  console.log('Legacy components to delete:');
  filesToDelete.forEach(file => console.log(`- ${file}`));
  
  const createBackupFiles = () => {
    const backupDir = path.join(PROJECT_ROOT, 'backup', new Date().toISOString().split('T')[0]);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    filesToDelete.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          const backupFile = path.join(backupDir, path.basename(file));
          fs.copyFileSync(file, backupFile);
          console.log(`Created backup: ${backupFile}`);
        }
      } catch (error) {
        console.error(`Error creating backup for ${file}:`, error);
      }
    });
    
    return backupDir;
  };
  
  // Create backups first
  const backupDir = createBackupFiles();
  console.log(`Created backups in: ${backupDir}`);
  
  // Skip deletion if in dry run mode
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log('DRY RUN: Skipping deletion of legacy components');
    return;
  }
  
  // Delete files
  console.log('Deleting legacy components...');
  filesToDelete.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Deleted: ${file}`);
      } else {
        console.log(`File not found: ${file}`);
      }
    } catch (error) {
      console.error(`Error deleting ${file}:`, error);
    }
  });
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Running in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);
  
  // Find files with placeholder components
  const placeholderComponentFiles = await findFilesWithPlaceholders();
  const placeholderPropFiles = await findFilesWithPlaceholderId();
  
  // Combine and deduplicate file lists
  const filesToMigrate = Array.from(new Set([...placeholderComponentFiles, ...placeholderPropFiles]));
  
  console.log(`Found ${filesToMigrate.length} files to migrate`);
  
  // Migrate each file
  const migrationResults = [];
  for (const file of filesToMigrate) {
    const result = await migrateComponent(file);
    migrationResults.push({ file, success: result });
  }
  
  // Print summary
  const successful = migrationResults.filter(r => r.success).length;
  console.log(`\nMigration Summary:`);
  console.log(`- Total files processed: ${migrationResults.length}`);
  console.log(`- Successfully migrated: ${successful}`);
  console.log(`- No changes needed: ${migrationResults.length - successful}`);
  
  // Cleanup legacy components if not in dry run mode
  if (!isDryRun) {
    await cleanupLegacyComponents();
  }
  
  console.log('\nMigration completed!');
  if (!isDryRun) {
    console.log('Please review the changes and fix any TODO comments before deploying.');
  }
}

main().catch(console.error); 