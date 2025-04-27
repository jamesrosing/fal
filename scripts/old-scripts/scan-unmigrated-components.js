import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Patterns to search for
const patterns = [
  {
    name: 'Next.js Image component',
    regex: /<Image\s+(?!.*?id=["'][^"']*["']).*?src=["'][^"']*["']/g,
    priority: 'high'
  },
  {
    name: 'Regular img tag',
    regex: /<img\s+(?!.*?id=["'][^"']*["']).*?src=["'][^"']*["']/g,
    priority: 'high'
  },
  {
    name: 'Video tag',
    regex: /<video\s+(?!.*?id=["'][^"']*["']).*?>.*?<\/video>/gs,
    priority: 'medium'
  },
  {
    name: 'Cloudinary URL',
    regex: /https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/[^"'\s)]+/g,
    priority: 'high'
  }
];

// Function to get the line number for a match
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// Function to get a few lines of context around a match
function getContext(content, index, lineCount = 3) {
  const lines = content.split('\n');
  const matchLine = getLineNumber(content, index) - 1;
  
  const startLine = Math.max(0, matchLine - lineCount);
  const endLine = Math.min(lines.length - 1, matchLine + lineCount);
  
  return lines.slice(startLine, endLine + 1).join('\n');
}

async function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex); // Create a new instance to reset lastIndex
      
      let match;
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = getLineNumber(content, match.index);
        const context = getContext(content, match.index, 1);
        
        issues.push({
          file: filePath,
          pattern: pattern.name,
          lineNumber,
          match: match[0],
          context,
          priority: pattern.priority
        });
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
    return [];
  }
}

async function main() {
  try {
    // Find all React files
    console.log('Scanning directories for files...');
    const appDir = './app';
    const componentsDir = './components';
    
    // Check if directories exist
    const appExists = fs.existsSync(appDir);
    const componentsExist = fs.existsSync(componentsDir);
    
    console.log(`App directory exists: ${appExists}`);
    console.log(`Components directory exists: ${componentsExist}`);
    
    // List some files to debug
    if (appExists) {
      const appFiles = fs.readdirSync(appDir);
      console.log(`App directory contains ${appFiles.length} items`);
      console.log('Sample items:', appFiles.slice(0, 5));
    }
    
    if (componentsExist) {
      const componentFiles = fs.readdirSync(componentsDir);
      console.log(`Components directory contains ${componentFiles.length} items`);
      console.log('Sample items:', componentFiles.slice(0, 5));
    }
    
    // Use absolute paths
    const appPattern = path.resolve(appDir, '**/*.{tsx,jsx}').replace(/\\/g, '/');
    const componentsPattern = path.resolve(componentsDir, '**/*.{tsx,jsx}').replace(/\\/g, '/');
    
    console.log('App pattern:', appPattern);
    console.log('Components pattern:', componentsPattern);
    
    const appFiles = await glob(appPattern);
    const componentFiles = await glob(componentsPattern);
    
    console.log('App files found:', appFiles.length);
    console.log('Component files found:', componentFiles.length);
    
    const allFiles = [...appFiles, ...componentFiles];
    
    console.log(`Found ${allFiles.length} files to scan`);
    
    let allIssues = [];
    
    // Process each file
    for (const file of allFiles) {
      const issues = await scanFile(file);
      
      if (issues.length > 0) {
        console.log(`Found ${issues.length} issues in ${file}`);
        allIssues = [...allIssues, ...issues];
      }
    }
    
    // Group issues by priority
    const highPriority = allIssues.filter(i => i.priority === 'high');
    const mediumPriority = allIssues.filter(i => i.priority === 'medium');
    const lowPriority = allIssues.filter(i => i.priority === 'low');
    
    // Write detailed report
    const report = {
      scannedFiles: allFiles.length,
      totalIssues: allIssues.length,
      issuesByPriority: {
        high: highPriority.length,
        medium: mediumPriority.length,
        low: lowPriority.length
      },
      scanDate: new Date().toISOString(),
      issues: allIssues
    };
    
    fs.writeFileSync(
      'unmigrated-components-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\nScan Summary:');
    console.log(`Total files: ${allFiles.length}`);
    console.log(`Files with issues: ${new Set(allIssues.map(i => i.file)).size}`);
    console.log(`Total issues: ${allIssues.length}`);
    console.log(`High priority issues: ${highPriority.length}`);
    console.log(`Medium priority issues: ${mediumPriority.length}`);
    console.log(`Low priority issues: ${lowPriority.length}`);
    console.log('\nDetailed report written to unmigrated-components-report.json');
    
    console.log('\nNext steps:');
    console.log('1. Run the migration script to automatically fix issues');
    console.log('2. Manually check any remaining high-priority issues');
    console.log('3. Test the application to ensure all media loads correctly');
    
  } catch (error) {
    console.error('Scan failed:', error);
    process.exit(1);
  }
}

main();