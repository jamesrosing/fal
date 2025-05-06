#!/usr/bin/env node
/**
 * Media Component Migration Script
 * 
 * This script helps migrate existing image/video components to the new UnifiedMedia system.
 * It scans the codebase for instances of old components and creates migration reports.
 * 
 * Usage:
 * node scripts/migrate-media.js
 * 
 * Options:
 * --scan         Scan for existing media components usage
 * --migrate      Generate migration suggestions for found components
 * --create-placeholders   Create placeholder entries in registry for found media
 * 
 * Example:
 * node scripts/migrate-media.js --scan
 * node scripts/migrate-media.js --migrate
 * node scripts/migrate-media.js --create-placeholders
 */

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// Component patterns to search for
const COMPONENT_PATTERNS = [
  'CloudinaryImage',
  'MediaImage',
  'UnifiedImage'
];

/**
 * Interface for component usage
 */
const ComponentUsage = {
  component: '',
  filePath: '',
  lineNumber: 0,
  code: '',
  publicId: '',
  assetId: '',
  src: ''
};

/**
 * Scan for components in the codebase
 */
async function scanForComponents() {
  console.log('Scanning for media components...');
  const usages = [];

  for (const component of COMPONENT_PATTERNS) {
    try {
      // Use grep to find instances of the component
      const { stdout } = await execAsync(`grep -r "<${component}" --include="*.tsx" --include="*.jsx" .`);
      
      // Process the results
      if (stdout) {
        const lines = stdout.split('\n').filter(Boolean);
        
        for (const line of lines) {
          // Parse the line to extract file path, line number, and code
          const [filePath, ...codeParts] = line.split(':');
          const code = codeParts.join(':').trim();
          
          // Extract line number using another grep command
          const { stdout: lineOutput } = await execAsync(`grep -n "${code.replace(/"/g, '\\"')}" "${filePath}"`);
          const lineNumber = lineOutput ? parseInt(lineOutput.split(':')[0]) : 0;
          
          // Extract props like publicId, assetId, src
          const publicId = (code.match(/publicId=["']([^"']+)["']/) || [])[1];
          const assetId = (code.match(/assetId=["']([^"']+)["']/) || [])[1];
          const src = (code.match(/src=["']([^"']+)["']/) || [])[1];
          
          usages.push({
            component,
            filePath,
            lineNumber,
            code,
            publicId,
            assetId,
            src
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning for ${component}:`, error);
    }
  }

  console.log(`Found ${usages.length} component usages`);
  return usages;
}

/**
 * Generate migration suggestions
 */
async function generateMigrationReport(usages) {
  console.log('Generating migration report...');
  
  let report = '# Media Component Migration Report\n\n';
  report += 'This report suggests how to migrate existing media components to the UnifiedMedia system.\n\n';
  
  for (const usage of usages) {
    report += `## ${usage.component} in ${usage.filePath}:${usage.lineNumber}\n\n`;
    report += '```jsx\n';
    report += usage.code;
    report += '\n```\n\n';
    
    report += '### Suggested Replacement\n\n';
    report += '```jsx\n';
    
    let placeholderId = '';
    
    if (usage.component === 'CloudinaryImage') {
      // For CloudinaryImage, use the publicId as a placeholder
      placeholderId = usage.publicId ? `cloudinary-${usage.publicId.replace(/\//g, '-')}` : '';
      report += `<UnifiedMedia placeholderId="${placeholderId}" alt="IMAGE DESCRIPTION" />`;
    } else if (usage.component === 'MediaImage') {
      // For MediaImage, use the assetId
      placeholderId = usage.assetId || '';
      report += `<UnifiedMedia placeholderId="${placeholderId}" alt="IMAGE DESCRIPTION" />`;
    } else if (usage.component === 'UnifiedImage') {
      // For UnifiedImage, use the placeholderId or create one from src
      placeholderId = (usage.code.match(/placeholderId=["']([^"']+)["']/) || [])[1] || 
                     (usage.src ? `src-${extractCloudinaryId(usage.src)}` : '');
      report += `<UnifiedMedia placeholderId="${placeholderId}" alt="IMAGE DESCRIPTION" />`;
    }
    
    report += '\n```\n\n';
    report += '---\n\n';
  }
  
  // Write the report to a file
  const reportPath = 'migration-report.md';
  await writeFileAsync(reportPath, report);
  console.log(`Migration report written to ${reportPath}`);
}

/**
 * Generate placeholder entries for the registry
 */
async function generatePlaceholderEntries(usages) {
  console.log('Generating placeholder entries for the registry...');
  
  // Registry file path
  const registryPath = 'lib/media/registry.ts';
  
  try {
    // Read the current registry file
    const registryContent = await readFileAsync(registryPath, 'utf8');
    
    // Extract the mediaRegistry object
    const registryMatch = registryContent.match(/export const mediaRegistry: Record<string, MediaAsset> = \{([\s\S]*?)\};/);
    
    if (!registryMatch) {
      console.error('Could not find mediaRegistry object in registry.ts');
      return;
    }
    
    // Start building the new registry entries
    let newEntries = '';
    
    for (const usage of usages) {
      let placeholderId = '';
      let publicId = '';
      
      if (usage.component === 'CloudinaryImage') {
        placeholderId = usage.publicId ? `cloudinary-${usage.publicId.replace(/\//g, '-')}` : '';
        publicId = usage.publicId || '';
      } else if (usage.component === 'MediaImage') {
        placeholderId = usage.assetId || '';
        // We don't have the publicId for MediaImage, need to look it up
      } else if (usage.component === 'UnifiedImage') {
        placeholderId = (usage.code.match(/placeholderId=["']([^"']+)["']/) || [])[1] || 
                       (usage.src ? `src-${extractCloudinaryId(usage.src)}` : '');
        publicId = usage.src ? extractCloudinaryId(usage.src) : '';
      }
      
      if (placeholderId && publicId && !registryContent.includes(`"${placeholderId}": {`)) {
        newEntries += `
  "${placeholderId}": {
    id: "${placeholderId}",
    publicId: "${publicId}",
    type: "image",
    description: "Migrated from ${usage.component} in ${usage.filePath}",
    area: "migrated",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    defaultOptions: {
      quality: 90,
      format: "auto"
    }
  },`;
      }
    }
    
    // Insert the new entries into the registry
    if (newEntries) {
      const newRegistryContent = registryContent.replace(
        /export const mediaRegistry: Record<string, MediaAsset> = \{/,
        `export const mediaRegistry: Record<string, MediaAsset> = {${newEntries}`
      );
      
      await writeFileAsync(registryPath, newRegistryContent);
      console.log(`Added ${newEntries.split('\n').filter(l => l.includes('id:')).length} new entries to the registry`);
    } else {
      console.log('No new entries to add to the registry');
    }
    
  } catch (error) {
    console.error('Error generating placeholder entries:', error);
  }
}

/**
 * Extract Cloudinary ID from a URL
 */
function extractCloudinaryId(url = '') {
  if (!url || typeof url !== 'string') return '';
  
  const match = url.match(/cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : '';
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Process arguments
  if (args.includes('--scan')) {
    const usages = await scanForComponents();
    
    // Save results to file
    await writeFileAsync('component-usages.json', JSON.stringify(usages, null, 2));
    console.log('Component usages saved to component-usages.json');
  }
  
  if (args.includes('--migrate')) {
    // Load saved usages or scan again
    let usages = [];
    try {
      if (await existsAsync('component-usages.json')) {
        usages = JSON.parse(await readFileAsync('component-usages.json', 'utf8'));
      } else {
        usages = await scanForComponents();
      }
      
      await generateMigrationReport(usages);
    } catch (error) {
      console.error('Error generating migration report:', error);
    }
  }
  
  if (args.includes('--create-placeholders')) {
    // Load saved usages or scan again
    let usages = [];
    try {
      if (await existsAsync('component-usages.json')) {
        usages = JSON.parse(await readFileAsync('component-usages.json', 'utf8'));
      } else {
        usages = await scanForComponents();
      }
      
      await generatePlaceholderEntries(usages);
    } catch (error) {
      console.error('Error creating placeholder entries:', error);
    }
  }
  
  if (args.length === 0) {
    console.log('No options specified. Available options:');
    console.log('  --scan                  Scan for existing media components usage');
    console.log('  --migrate               Generate migration suggestions');
    console.log('  --create-placeholders   Create placeholder entries in registry');
  }
}

// Run the main function
main().catch(console.error); 