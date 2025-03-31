import fs from 'fs';

try {
  console.log("Starting media analysis...");
  console.log("Current directory:", process.cwd());
  
  // Check if results file exists
  if (!fs.existsSync('media-audit-results.json')) {
    console.error("Error: media-audit-results.json not found");
    console.log("Files in current directory:", fs.readdirSync('.').join(', '));
    process.exit(1);
  }
  
  // Read the JSON results file
  console.log("Reading media-audit-results.json...");
  const results = JSON.parse(fs.readFileSync('media-audit-results.json', 'utf8'));
  console.log(`Successfully read results with ${results.length} entries`);

  // Count patterns
  const patternCounts = {};
  results.forEach(item => {
    const pattern = item.pattern;
    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
  });

  // Count by file extension for src attributes
  const srcPatterns = results.filter(item => item.pattern === '/src=[\\"\']/');
  const extensions = {};
  const sourceTypes = {
    cloudinary: 0,
    local: 0,
    external: 0,
    other: 0
  };

  srcPatterns.forEach(item => {
    const content = item.context;
    // Extract the actual URL or path
    const match = content.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      const url = match[1];
      // Check source type
      if (url.includes('cloudinary.com')) {
        sourceTypes.cloudinary++;
      } else if (url.startsWith('/') || url.startsWith('./')) {
        sourceTypes.local++;
      } else if (url.startsWith('http')) {
        sourceTypes.external++;
      } else {
        sourceTypes.other++;
      }
      
      // Extract extension
      const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
      if (extMatch && extMatch[1]) {
        const ext = extMatch[1].toLowerCase();
        extensions[ext] = (extensions[ext] || 0) + 1;
      }
    }
  });

  // Count by directory
  const directoryCounts = {};
  results.forEach(item => {
    const filePath = item.filePath;
    const directory = filePath.split('\\')[0] + '/' + (filePath.split('\\')[1] || "");
    directoryCounts[directory] = (directoryCounts[directory] || 0) + 1;
  });

  // Generate report
  console.log('=== Media Usage Analysis ===');
  console.log(`Total media usages found: ${results.length}`);
  console.log('\n=== Media Pattern Usage ===');
  Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`${pattern}: ${count}`);
    });

  console.log('\n=== Media Source Types ===');
  Object.entries(sourceTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

  console.log('\n=== Media File Extensions ===');
  Object.entries(extensions)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      console.log(`${ext}: ${count}`);
    });

  console.log('\n=== Usage by Directory ===');
  Object.entries(directoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      console.log(`${dir}: ${count}`);
    });

  // Generate Cloudinary URL patterns
  console.log('\n=== Cloudinary URL Patterns ===');
  const cloudinaryUrls = srcPatterns
    .filter(item => item.context.includes('cloudinary.com'))
    .map(item => {
      const match = item.context.match(/src=["']([^"']+)["']/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  // Extract folder patterns from Cloudinary URLs
  const folderPatterns = {};
  cloudinaryUrls.forEach(url => {
    // Extract the path after /upload/
    const match = url.match(/\/upload\/[^/]*\/([^/]+)/);
    if (match && match[1]) {
      const folder = match[1];
      folderPatterns[folder] = (folderPatterns[folder] || 0) + 1;
    }
  });

  // Show folder patterns
  Object.entries(folderPatterns)
    .sort((a, b) => b[1] - a[1])
    .forEach(([folder, count]) => {
      console.log(`${folder}: ${count}`);
    });

  // Make sure we're saving to a valid location
  const outputFile = './media-audit-analysis.json';
  console.log(`Writing analysis to: ${outputFile}`);
  
  // Save analysis to file
  const report = {
    totalUsages: results.length,
    patternCounts,
    sourceTypes,
    extensions,
    directoryCounts,
    folderPatterns
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log('\nAnalysis saved to media-audit-analysis.json');
} catch (error) {
  console.error("Error occurred:", error);
} 