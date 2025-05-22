const fs = require('fs');
const path = require('path');

// List of files that need fixing
const filesToFix = [
  'team-section.tsx',
  'plastic-surgery-section.tsx',
  'mission-section.tsx',
  'medical-spa-section.tsx',
  'hero-section.tsx',
  'functional-medicine-section.tsx'
];

const sectionsDir = path.join('D:\\fal\\components\\shared\\layout\\sections');

filesToFix.forEach(file => {
  const filePath = path.join(sectionsDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the incorrect import path
    const updatedContent = content.replace(
      /from\s+"\.\.\/ui\//g,
      'from "../../ui/'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Fixed imports in: ${file}`);
    } else {
      console.log(`No changes needed in: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('\nDone fixing section imports!');
