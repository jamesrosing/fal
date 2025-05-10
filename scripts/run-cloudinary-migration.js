import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure script paths
const SCRIPT_DB = path.join(__dirname, 'migrate-media-to-cloudinary.js');
const SCRIPT_CODE = path.join(__dirname, 'cloudinary-code-migration.js');
const SCRIPT_CLEANUP = path.join(__dirname, 'cleanup-legacy-media.js');

// Log function with timestamps
function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

// Run a script and capture output
function runScript(scriptPath, env = {}) {
  log(`Running: ${path.basename(scriptPath)}`);
  log('----------------------------------------');
  
  try {
    // Combine current env with any additional vars
    const scriptEnv = { ...process.env, ...env };
    
    // Execute the script and capture output
    const output = execSync(`node ${scriptPath}`, { 
      encoding: 'utf8',
      env: scriptEnv,
      stdio: 'inherit' // Show output in real-time
    });
    
    log('----------------------------------------');
    log(`✅ Completed: ${path.basename(scriptPath)}`);
    return { success: true };
  } catch (error) {
    log('----------------------------------------');
    log(`❌ Failed: ${path.basename(scriptPath)}`);
    log(`Error: ${error.message}`);
    return { success: false, error };
  }
}

// Main migration function
async function runMigration() {
  log('🚀 STARTING CLOUDINARY MIGRATION');
  log('========================================');
  
  // Step 1: Database Migration
  log('STEP 1/3: Database Migration');
  const dbResult = runScript(SCRIPT_DB);
  
  if (!dbResult.success) {
    log('Migration aborted due to database migration failure');
    process.exit(1);
  }
  
  // Step 2: Code Migration
  log('STEP 2/3: Code Migration');
  const codeResult = runScript(SCRIPT_CODE);
  
  if (!codeResult.success) {
    log('Migration continuing despite code migration issues');
  }
  
  // Step 3: Cleanup Legacy Components
  log('STEP 3/3: Cleanup Legacy Components');
  const cleanupResult = runScript(SCRIPT_CLEANUP, { FORCE_CLEANUP: 'true' });
  
  // Final summary
  log('========================================');
  log('MIGRATION SUMMARY:');
  log(`Database Migration: ${dbResult.success ? '✅ Success' : '❌ Failed'}`);
  log(`Code Migration: ${codeResult.success ? '✅ Success' : '❌ Failed'}`);
  log(`Legacy Cleanup: ${cleanupResult.success ? '✅ Success' : '❌ Failed'}`);
  log('========================================');
  
  if (dbResult.success && codeResult.success && cleanupResult.success) {
    log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
  } else {
    log('⚠️ MIGRATION COMPLETED WITH ISSUES');
  }
}

// Self-executing function
(async () => {
  try {
    await runMigration();
  } catch (error) {
    console.error('Migration failed unexpectedly:', error);
    process.exit(1);
  }
})(); 