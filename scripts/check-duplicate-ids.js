#!/usr/bin/env node

/**
 * Check for Duplicate IDs in Media Map
 * 
 * This script checks the media map data for duplicate placeholder IDs
 * that could cause React key errors.
 */

import fs from 'fs';
import path from 'path';

// Define the path to the media map data file
const dataFilePath = path.join(process.cwd(), 'app/api/site/media-map/data.json');

// Function to extract all placeholder IDs from the media map
function extractPlaceholderIds(mediaMap) {
  const ids = [];
  const idCounts = {};
  
  // Recursive function to traverse the media map
  function traverse(node) {
    if (node.mediaPlaceholders && Array.isArray(node.mediaPlaceholders)) {
      node.mediaPlaceholders.forEach(placeholder => {
        ids.push(placeholder.id);
        idCounts[placeholder.id] = (idCounts[placeholder.id] || 0) + 1;
      });
    }
    
    if (node.sections && Array.isArray(node.sections)) {
      node.sections.forEach(section => traverse(section));
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  // Traverse each top-level node
  mediaMap.forEach(node => traverse(node));
  
  return { ids, idCounts };
}

// Main function
async function checkDuplicateIds() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      console.error('Media map not found. Run `npm run generate-media-map` to create it.');
      return;
    }
    
    // Read and parse the data file
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const mediaMap = JSON.parse(rawData);
    
    // Extract all placeholder IDs
    const { ids, idCounts } = extractPlaceholderIds(mediaMap);
    
    // Find duplicate IDs
    const duplicates = Object.entries(idCounts)
      .filter(([id, count]) => count > 1)
      .map(([id, count]) => ({ id, count }));
    
    // Print results
    console.log(`Found ${ids.length} total placeholder IDs.`);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate IDs:`);
      duplicates.forEach(({ id, count }) => {
        console.log(`  "${id}" appears ${count} times`);
      });
      
      console.log('\nThis will cause React key errors. You should fix these duplicates.');
    } else {
      console.log('No duplicate IDs found. All placeholder IDs are unique.');
    }
  } catch (error) {
    console.error('Error checking for duplicate IDs:', error);
  }
}

// Run the script
checkDuplicateIds().catch(console.error); 