// scripts/cleanup-legacy-media.js
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
const COMPONENTS_TO_DELETE = [
  'components/CloudinaryImage.tsx',
  'components/CloudinaryUploader.tsx',
  'components/team-member-image-upload.tsx',
  'components/image-uploader.tsx',
  'components/UnifiedImage.tsx',
  'components/UnifiedVideo.tsx',
  'components/OptimizedImage.tsx',
  'components/OptimizedVideo.tsx',
  'components/ServerImage.tsx',
  'components/MediaRenderer.tsx',
  'components/CloudinaryMedia.tsx'
];

// Function to check for remaining references to legacy components
async function checkRemainingReferences() {
  console.log('Checking for remaining references to legacy components...');
  
  const componentNames = COMPONENTS_TO_DELETE.map(path => {
    const basename = path.split('/').pop();
    return basename.replace(/\.[^/.]+$/, ""); // Remove file extension
  });
  
  let remainingReferences = [];
  
  // Windows-compatible execution with PowerShell
  try {
    const pattern = componentNames.join('|');
    const command = `powershell -Command "Get-ChildItem -Path . -Recurse -Include *.tsx,*.jsx,*.ts,*.js | Select-String -Pattern '${pattern}' | ForEach-Object { $_.Path } | Sort-Object -Unique"`;
    const output = execSync(command, { encoding: 'utf8' });
    remainingReferences = output.split(/\r?\n/).filter(Boolean);
  } catch (error) {
    console.warn('PowerShell search failed, falling back to manual search:', error);
    
    // Fallback to manual glob search
    const files = glob.sync('**/*.{tsx,jsx,ts,js}', {
      ignore: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/backup/**', '**/*.d.ts', '**/scripts/**'],
      cwd: PROJECT_ROOT,
      absolute: true
    });
    
    // Check each file for legacy component references
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (componentNames.some(comp => content.includes(comp))) {
          remainingReferences.push(file);
        }
      } catch (error) {
        console.warn(`Error reading file ${file}:`, error);
      }
    }
  }
  
  // Filter out references in the migration scripts themselves
  remainingReferences = remainingReferences.filter(file => 
    !file.includes('scripts/migrate-media-to-cloudinary') &&
    !file.includes('scripts/cloudinary-code-migration') &&
    !file.includes('scripts/cleanup-legacy-media')
  );
  
  return remainingReferences;
}

// Function to backup components before deletion
function backupComponents() {
  console.log('Backing up legacy components before deletion...');
  
  const backupDir = path.join(PROJECT_ROOT, 'backup', '2025-03-29', 'legacy-media-components');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  let backedUp = 0;
  
  for (const componentPath of COMPONENTS_TO_DELETE) {
    const fullPath = path.join(PROJECT_ROOT, componentPath);
    if (fs.existsSync(fullPath)) {
      const destPath = path.join(backupDir, componentPath.split('/').pop());
      fs.copyFileSync(fullPath, destPath);
      backedUp++;
    }
  }
  
  console.log(`Backed up ${backedUp} legacy components to ${backupDir}`);
  return backedUp;
}

// Function to delete legacy components
function deleteComponents() {
  console.log('Deleting legacy components...');
  
  let deleted = 0;
  
  for (const componentPath of COMPONENTS_TO_DELETE) {
    const fullPath = path.join(PROJECT_ROOT, componentPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted: ${componentPath}`);
      deleted++;
    } else {
      console.log(`Component already removed or not found: ${componentPath}`);
    }
  }
  
  console.log(`Deleted ${deleted} legacy components`);
  return deleted;
}

// Main cleanup function
async function cleanupLegacyMedia() {
  console.log('Starting cleanup of legacy media components...');
  
  // 1. Check for remaining references
  const remainingReferences = await checkRemainingReferences();
  
  if (remainingReferences.length > 0) {
    console.log(`\nWARNING: Found ${remainingReferences.length} files that still reference legacy components:`);
    remainingReferences.forEach(file => console.log(`- ${file}`));
    console.log('\nPlease run the cloudinary-code-migration.js script first to update these references.');
    
    // Ask if we should continue anyway
    console.log('\nWould you like to continue with the cleanup anyway? (y/n)');
    process.stdout.write('> ');
    
    // In automated environment, default to no
    const shouldContinue = process.env.FORCE_CLEANUP === 'true';
    
    if (!shouldContinue) {
      console.log('Cleanup aborted. Please run the cloudinary-code-migration.js script first.');
      return;
    }
  }
  
  // 2. Backup components before deletion
  const backedUp = backupComponents();
  
  if (backedUp === 0) {
    console.log('No components found to back up. They may have already been deleted.');
  }
  
  // 3. Delete the legacy components
  const deleted = deleteComponents();
  
  if (deleted === 0) {
    console.log('No components deleted. They may have already been removed.');
  }
  
  console.log('\nLegacy media component cleanup completed!');
}

// Self-executing function
(async () => {
  try {
    await cleanupLegacyMedia();
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
})(); 