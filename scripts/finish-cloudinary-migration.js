#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import chalk from 'chalk';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Configure paths
const SERVICES_DIR = path.join(ROOT_DIR, 'app/services');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');
const BACKUP_DIR = path.join(ROOT_DIR, 'backup', new Date().toISOString().split('T')[0]);

// Log with timestamps
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(chalk.green(`${prefix} ✅ ${message}`));
      break;
    case 'error':
      console.error(chalk.red(`${prefix} ❌ ${message}`));
      break;
    case 'warning':
      console.warn(chalk.yellow(`${prefix} ⚠️ ${message}`));
      break;
    case 'info':
    default:
      console.log(chalk.blue(`${prefix} ℹ️ ${message}`));
  }
}

// Create backup directory if it doesn't exist
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`Created backup directory: ${BACKUP_DIR}`, 'info');
  }
}

// Create a backup of a file before modifying it
function backupFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  
  // Create directories if they don't exist
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Copy the file
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Find all files with OptimizedImage imports
function findFilesWithOptimizedImage() {
  log('Searching for files with OptimizedImage imports or usage...', 'info');
  
  // Define patterns to search for
  const patterns = [
    'app/**/*.tsx',
    'components/**/*.tsx',
  ];
  
  // Find all matching files
  const files = patterns.flatMap(pattern => 
    globSync(pattern, { cwd: ROOT_DIR })
      .map(file => path.join(ROOT_DIR, file))
  );
  
  // Filter files that contain OptimizedImage
  const filesWithOptimizedImage = files.filter(file => {
    const content = fs.readFileSync(file, 'utf8');
    return (
      content.includes('OptimizedImage') || 
      content.includes('import OptimizedImage')
    );
  });
  
  log(`Found ${filesWithOptimizedImage.length} files with OptimizedImage references`, 'info');
  return filesWithOptimizedImage;
}

// Replace OptimizedImage with CldImage in a file
function replaceFunctionalComponentFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import statements
  const importPattern = /import\s+OptimizedImage\s+from\s+['"](@\/components\/media|\.\/|\.\.\/\S+)\/OptimizedImage['"]/g;
  const newImport = `import { CldImage } from 'next-cloudinary'`;
  if (importPattern.test(content)) {
    content = content.replace(importPattern, newImport);
    modified = true;
  }
  
  // Replace OptimizedImage tags with CldImage
  const componentPattern = /<OptimizedImage\s+id="([^"]+)"([^>]*)\/>/g;
  content = content.replace(componentPattern, (match, id, props) => {
    modified = true;
    // Convert id to publicId
    return `<CldImage publicId="${id}"${props}/>`;
  });
  
  // For multi-line OptimizedImage components
  const multilinePattern = /<OptimizedImage\s+id="([^"]+)"([^>]*)>\s*<\/OptimizedImage>/g;
  content = content.replace(multilinePattern, (match, id, props) => {
    modified = true;
    return `<CldImage publicId="${id}"${props}></CldImage>`;
  });
  
  // If modified, write back to the file
  if (modified) {
    backupFile(filePath);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Update component (section.tsx) to use CldImage instead of OptimizedImage
function updateSectionComponent() {
  const sectionPath = path.join(COMPONENTS_DIR, 'section.tsx');
  
  if (fs.existsSync(sectionPath)) {
    let content = fs.readFileSync(sectionPath, 'utf8');
    const modified = content.includes('OptimizedImage');
    
    if (modified) {
      backupFile(sectionPath);
      
      // Replace import
      content = content.replace(
        /import OptimizedImage from '@\/components\/media\/OptimizedImage';/g,
        `import { CldImage } from 'next-cloudinary';`
      );
      
      // Replace usage
      content = content.replace(
        /<OptimizedImage\s+id=/g,
        '<CldImage publicId='
      );
      
      fs.writeFileSync(sectionPath, content, 'utf8');
      log(`Updated section.tsx to use CldImage`, 'success');
    }
  }
}

// Move OptimizedImage to legacy directory for reference before removal
function moveOptimizedImageToLegacy() {
  const optimizedImagePath = path.join(COMPONENTS_DIR, 'media/OptimizedImage.tsx');
  const legacyDir = path.join(ROOT_DIR, 'backup', new Date().toISOString().split('T')[0], 'legacy-media-components');
  
  if (fs.existsSync(optimizedImagePath)) {
    // Create legacy directory
    if (!fs.existsSync(legacyDir)) {
      fs.mkdirSync(legacyDir, { recursive: true });
    }
    
    // Copy file to legacy directory
    const destPath = path.join(legacyDir, 'OptimizedImage.tsx');
    fs.copyFileSync(optimizedImagePath, destPath);
    log(`Moved OptimizedImage.tsx to legacy reference directory`, 'info');
  }
}

// Main function
async function migrateRemainingComponents() {
  log('🚀 STARTING CLOUDINARY MIGRATION COMPLETION', 'info');
  log('============================================', 'info');
  
  try {
    // Ensure backup directory
    ensureBackupDir();
    
    // Find files using OptimizedImage
    const files = findFilesWithOptimizedImage();
    
    // Replace OptimizedImage with CldImage in each file
    let modifiedCount = 0;
    for (const file of files) {
      if (replaceFunctionalComponentFile(file)) {
        log(`Updated ${path.relative(ROOT_DIR, file)}`, 'success');
        modifiedCount++;
      }
    }
    
    // Update section component
    updateSectionComponent();
    
    // Move OptimizedImage to legacy directory
    moveOptimizedImageToLegacy();
    
    log('============================================', 'info');
    log(`🎉 MIGRATION COMPLETE: Modified ${modifiedCount} files`, 'success');
    log('Next steps:', 'info');
    log('1. Test the application to ensure all images render correctly', 'info');
    log('2. Remove OptimizedImage.tsx after confirming everything works', 'info');
    log(`3. Check the backup directory at ${BACKUP_DIR} for backups`, 'info');
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Self-executing function
(async () => {
  await migrateRemainingComponents();
})(); 