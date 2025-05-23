/**
 * Migration Status Reporter
 * 
 * This script analyzes the codebase to identify components that still need
 * to be migrated from placeholder-based media to direct Cloudinary usage.
 */
const fs = require('fs').promises;
const path = require('path');

// Patterns to search for
const patterns = {
  unifiedMediaComponent: /<UnifiedMedia/g,
  legacyPlaceholderId: /placeholderId=/g,
  legacyMediaApi: /\/api\/media\//g,
  mediaRegistry: /mediaRegistry/g,
  cloudinaryComponents: /<Cld(Image|VideoPlayer)/g,
  cloudinaryApi: /\/api\/cloudinary\//g
};

// Function to scan directories for matching files
async function findFiles(dir, extensions = ['.tsx', '.jsx', '.ts', '.js']) {
  let results = [];
  
  try {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && 
          file !== 'node_modules' && 
          file !== '.next' && 
          file !== 'cloudinary-migration') {
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

// Function to analyze file content
async function analyzeFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const results = {};
    
    // Check for each pattern
    for (const [key, pattern] of Object.entries(patterns)) {
      // Reset regex state
      pattern.lastIndex = 0;
      
      const matches = content.match(pattern) || [];
      results[key] = matches.length;
    }
    
    // Check if this file needs migration
    const needsMigration = (
      results.unifiedMediaComponent > 0 ||
      results.legacyPlaceholderId > 0 ||
      results.legacyMediaApi > 0 ||
      results.mediaRegistry > 0
    );
    
    // Check if this file already uses new components
    const usesNewComponents = (
      results.cloudinaryComponents > 0 ||
      results.cloudinaryApi > 0
    );
    
    return {
      filePath,
      ...results,
      needsMigration,
      usesNewComponents,
      status: needsMigration 
        ? (usesNewComponents ? 'partial' : 'pending')
        : (usesNewComponents ? 'migrated' : 'n/a')
    };
  } catch (err) {
    console.error(`Error analyzing file ${filePath}:`, err);
    return { filePath, error: err.message, status: 'error' };
  }
}

// Main function
async function checkMigrationStatus() {
  try {
    const rootDir = process.cwd();
    console.log(`Scanning directory: ${rootDir}`);
    
    // Find all relevant files
    const files = await findFiles(rootDir);
    console.log(`Found ${files.length} files to analyze`);
    
    // Analyze each file
    const results = [];
    let totalFiles = 0;
    let pendingMigration = 0;
    let partialMigration = 0;
    let completedMigration = 0;
    
    for (const filePath of files) {
      const analysis = await analyzeFile(filePath);
      
      if (analysis.needsMigration || analysis.usesNewComponents) {
        results.push(analysis);
        totalFiles++;
        
        if (analysis.status === 'pending') pendingMigration++;
        if (analysis.status === 'partial') partialMigration++;
        if (analysis.status === 'migrated') completedMigration++;
      }
    }
    
    // Sort results by status (pending first, then partial, then migrated)
    results.sort((a, b) => {
      const statusOrder = { pending: 0, partial: 1, migrated: 2, 'n/a': 3, error: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    
    // Generate report
    const report = {
      summary: {
        totalRelevantFiles: totalFiles,
        pendingMigration,
        partialMigration,
        completedMigration,
        progress: Math.round((completedMigration / totalFiles) * 100) || 0
      },
      details: results
    };
    
    // Save report
    const reportPath = path.join(rootDir, 'cloudinary-migration-status.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Log summary
    console.log('\nMigration Status:');
    console.log(`Total files needing migration: ${totalFiles}`);
    console.log(`Pending migration: ${pendingMigration}`);
    console.log(`Partial migration: ${partialMigration}`);
    console.log(`Completed migration: ${completedMigration}`);
    console.log(`Progress: ${report.summary.progress}%`);
    console.log(`\nFull report saved to: ${reportPath}`);
    
    // List top 10 files needing migration
    if (pendingMigration > 0) {
      console.log('\nTop files needing migration:');
      const pendingFiles = results
        .filter(r => r.status === 'pending')
        .slice(0, 10);
      
      pendingFiles.forEach((file, i) => {
        console.log(`${i+1}. ${file.filePath}`);
        console.log(`   Legacy components: ${file.unifiedMediaComponent}, Placeholder IDs: ${file.legacyPlaceholderId}`);
      });
    }
  } catch (err) {
    console.error('Error in migration status check:', err);
  }
}

// Run the function
checkMigrationStatus();