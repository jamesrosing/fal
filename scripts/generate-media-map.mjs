#!/usr/bin/env node

/**
 * Media Map Generator
 * 
 * This script scans the codebase for media placeholders defined in page components and
 * generates a structured sitemap of all media locations. The generated map can be used
 * by the admin interface to manage media placements.
 * 
 * Usage: npm run generate-media-map
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'app');
const outputFile = path.join(rootDir, 'app/api/site/media-map/data.json');

/**
 * Get media placeholders from a component file
 * 
 * Attempts to load the file and call getMediaPlaceholders() if it exists
 * 
 * @param {string} filePath Path to the component file
 * @returns {Array} Array of media placeholders or empty array if none found
 */
function getMediaPlaceholdersFromFile(filePath) {
  try {
    // In a real implementation, we would use a proper module loader
    // For now, we'll stub this with some example placeholders based on file path
    
    // Extract page name from path
    const relativePath = path.relative(rootDir, filePath);
    const pathParts = relativePath.split(path.sep);
    
    // Skip non-page files
    if (!relativePath.includes('page.') && !relativePath.includes('layout.')) {
      return [];
    }
    
    // Extract page, section, and container from path
    const page = pathParts.length > 1 ? pathParts[1] : 'home';
    const section = pathParts.length > 2 ? pathParts[2] : 'main';
    
    // For demo purposes, let's create a sample placeholder for this page
    const fileName = path.basename(filePath, path.extname(filePath));
    const placeholderId = `${page}-${section}-image`;
    
    return [{
      id: placeholderId,
      type: 'image',
      page,
      section,
      dimensions: {
        width: 1200,
        height: 800,
        aspectRatio: 1.5
      },
      description: `Main image for ${page} ${section}`
    }];
  } catch (error) {
    console.error(`Error extracting placeholders from ${filePath}:`, error);
    return [];
  }
}

/**
 * Organize placeholders into a structured sitemap
 * 
 * @param {Array} placeholders Array of all placeholders
 * @returns {Object} Structured sitemap object
 */
function organizePlaceholders(placeholders) {
  // Create a sitemap structure
  const sitemap = [];
  
  // Group placeholders by page
  const pageGroups = {};
  
  placeholders.forEach(placeholder => {
    const { page } = placeholder;
    
    if (!pageGroups[page]) {
      pageGroups[page] = {
        id: page,
        name: page.charAt(0).toUpperCase() + page.slice(1),
        path: `/${page}`,
        sections: {}
      };
    }
    
    // Group by section within page
    const section = placeholder.section || 'main';
    if (!pageGroups[page].sections[section]) {
      pageGroups[page].sections[section] = {
        id: section,
        name: section.charAt(0).toUpperCase() + section.slice(1),
        description: `${section} section for ${page} page`,
        mediaPlaceholders: []
      };
    }
    
    // Add placeholder to the appropriate section
    pageGroups[page].sections[section].mediaPlaceholders.push(placeholder);
  });
  
  // Convert the grouped structure to the final format
  Object.values(pageGroups).forEach(page => {
    const pageEntry = {
      id: page.id,
      name: page.name,
      path: page.path,
      sections: Object.values(page.sections)
    };
    sitemap.push(pageEntry);
  });
  
  return sitemap;
}

/**
 * Main function to run the script
 */
async function main() {
  console.log('Generating media map...');
  console.log('Scanning files for media placeholders...');
  
  // Find all page and layout files
  const pageFiles = globSync('**/*.{js,jsx,ts,tsx}', { cwd: appDir, absolute: true });
  
  console.log(`Found ${pageFiles.length} files to scan.`);
  
  // Extract placeholders from each file
  let allPlaceholders = [];
  for (const file of pageFiles) {
    const placeholders = getMediaPlaceholdersFromFile(file);
    allPlaceholders = [...allPlaceholders, ...placeholders];
  }
  
  // Remove duplicates based on ID
  const uniquePlaceholders = Object.values(
    allPlaceholders.reduce((acc, placeholder) => {
      acc[placeholder.id] = placeholder;
      return acc;
    }, {})
  );
  
  console.log(`Found ${uniquePlaceholders.length} unique media placeholders.`);
  
  // Organize placeholders into a sitemap
  const mediaMap = organizePlaceholders(uniquePlaceholders);
  
  // Count placeholders by section
  let sectionCount = 0;
  let placeholderCount = 0;
  mediaMap.forEach(page => {
    sectionCount += page.sections.length;
    page.sections.forEach(section => {
      placeholderCount += section.mediaPlaceholders.length;
    });
  });
  
  console.log(`Organized into ${mediaMap.length} pages, ${sectionCount} sections, and ${placeholderCount} placeholders.`);
  
  // Write the media map to the output file
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(mediaMap, null, 2));
  
  console.log(`Media map written to ${outputFile}`);
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 