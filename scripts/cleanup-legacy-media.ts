// scripts/cleanup-legacy-media.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Configuration
const PROJECT_ROOT = process.cwd();
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');

// Files to remove after successful migration
const filesToRemove = [
  // Legacy components
  path.join(COMPONENTS_DIR, 'media/UnifiedImage.tsx'),
  path.join(COMPONENTS_DIR, 'media/OptimizedImage.tsx'),
  path.join(COMPONENTS_DIR, 'media/OptimizedVideo.tsx'),
  path.join(COMPONENTS_DIR, 'media/ServerImage.tsx'),
  path.join(COMPONENTS_DIR, 'media/MediaRenderer.tsx'),
  path.join(COMPONENTS_DIR, 'media/CloudinaryMedia.tsx'),
  
  // Legacy services and configurations
  path.join(PROJECT_ROOT, 'lib/services/media-service.ts'),
  path.join(PROJECT_ROOT, 'lib/media/registry.ts'),
  path.join(PROJECT_ROOT, 'lib/image-config.js')
];

// Database tables that can be cleaned up after migration
const tablesToCleanup = [
  'media_assets_old',
  'media_placeholders'
];

// Check for remaining references to legacy components
function checkForRemainingReferences() {
  console.log('\nChecking for remaining references to legacy components...');
  
  try {
    const legacyPatterns = [
      'UnifiedImage',
      'OptimizedImage',
      'OptimizedVideo',
      'ServerImage',
      'MediaRenderer',
      'CloudinaryMedia',
      'media-service',
      'placeholderId='
    ].join('\\|');
    
    const grepCommand = `grep -r "${legacyPatterns}" --include="*.tsx" --include="*.jsx" --include="*.ts" ${COMPONENTS_DIR}`;
    const result = execSync(grepCommand).toString();
    
    if (result.trim()) {
      console.log('⚠️ WARNING: Found remaining references to legacy components:');
      console.log(result);
      return false;
    } else {
      console.log('✅ No remaining references found. Safe to proceed with cleanup!');
      return true;
    }
  } catch (error) {
    // If grep doesn't find anything, it exits with code 1
    console.log('✅ No remaining references found. Safe to proceed with cleanup!');
    return true;
  }
}

// Create backups of files before deleting
function createBackups() {
  const backupDir = path.join(PROJECT_ROOT, 'backup', new Date().toISOString().split('T')[0]);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  console.log(`\nCreating backups in: ${backupDir}`);
  
  filesToRemove.forEach(file => {
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
}

// Delete legacy files
function deleteFiles() {
  console.log('\nDeleting legacy files:');
  
  filesToRemove.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✅ Deleted: ${file}`);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error deleting ${file}:`, error);
    }
  });
}

// Print SQL commands to clean up database tables
function printDatabaseCleanupInstructions() {
  console.log('\nDatabase cleanup instructions:');
  
  tablesToCleanup.forEach(table => {
    console.log(`- After confirming migration success, run: \`DROP TABLE IF EXISTS ${table};\``);
  });
}

// Main function
async function main() {
  console.log('LEGACY MEDIA CLEANUP');
  console.log('====================');
  
  // Check if we're in dry run mode
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log('Running in DRY RUN mode - no files will be deleted');
  }
  
  // List files that will be removed
  console.log('\nFiles marked for deletion:');
  filesToRemove.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`- ${file} ${exists ? '(exists)' : '(not found)'}`);
  });
  
  // Check for remaining references
  const isSafeToDelete = checkForRemainingReferences();
  
  if (!isSafeToDelete) {
    console.log('\n⚠️ WARNING: Found remaining references to legacy components.');
    console.log('It is recommended to complete the migration before cleaning up.');
    
    if (!process.argv.includes('--force')) {
      console.log('Use --force flag to proceed with cleanup anyway.');
      return;
    }
    
    console.log('Proceeding with cleanup due to --force flag...');
  }
  
  // Create backups first
  const backupDir = createBackups();
  
  // Skip deletion if in dry run mode
  if (isDryRun) {
    console.log('\nDRY RUN: Skipping deletion of legacy components');
  } else {
    // Delete the files
    deleteFiles();
  }
  
  // Print database cleanup instructions
  printDatabaseCleanupInstructions();
  
  console.log('\nCleanup process completed!');
  if (backupDir) {
    console.log(`Backups created in: ${backupDir}`);
  }
  console.log('Remember to verify your application works correctly after cleanup.');
}

main().catch(console.error); 