#!/usr/bin/env node

/**
 * Fix Duplicate IDs in Media Map
 * 
 * This script fixes duplicate placeholder IDs in the media map data
 * by appending a unique suffix to each duplicate.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the path to the media map data file
const dataFilePath = path.join(process.cwd(), 'app/api/site/media-map/data.json');

// Function to find duplicate IDs in the media map
function findDuplicateIds(mediaMap) {
  const idCounts = {};
  const idLocations = {};
  
  // Recursive function to traverse the media map
  function traverse(node, path = []) {
    if (node.mediaPlaceholders && Array.isArray(node.mediaPlaceholders)) {
      node.mediaPlaceholders.forEach((placeholder, index) => {
        const id = placeholder.id;
        idCounts[id] = (idCounts[id] || 0) + 1;
        
        if (!idLocations[id]) {
          idLocations[id] = [];
        }
        
        idLocations[id].push({
          node,
          index,
          path: [...path, node.id || 'root'],
          placeholder
        });
      });
    }
    
    if (node.sections && Array.isArray(node.sections)) {
      node.sections.forEach(section => traverse(section, [...path, node.id || 'root']));
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => traverse(child, [...path, node.id || 'root']));
    }
  }
  
  // Traverse each top-level node
  mediaMap.forEach(node => traverse(node));
  
  // Find duplicate IDs
  const duplicates = Object.entries(idCounts)
    .filter(([id, count]) => count > 1)
    .map(([id, count]) => ({ id, count, locations: idLocations[id] }));
  
  return duplicates;
}

// Function to fix duplicate IDs in the media map
async function fixDuplicateIds() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      console.error('Media map not found. Run `npm run generate-media-map` to create it.');
      return;
    }
    
    // Read and parse the data file
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const mediaMap = JSON.parse(rawData);
    
    // Find duplicate IDs
    const duplicates = findDuplicateIds(mediaMap);
    
    if (duplicates.length === 0) {
      console.log('No duplicate IDs found. All placeholder IDs are unique.');
      return;
    }
    
    console.log(`Found ${duplicates.length} duplicate IDs. Fixing...`);
    
    // Track ID changes for database updates
    const idChanges = [];
    
    // Fix each duplicate ID
    for (const { id, count, locations } of duplicates) {
      console.log(`Fixing "${id}" (appears ${count} times)...`);
      
      // Skip the first occurrence (keep the original ID)
      for (let i = 1; i < locations.length; i++) {
        const { node, index, path, placeholder } = locations[i];
        
        // Generate a new unique ID
        const newId = `${id}-${path.join('-')}-${i}`;
        
        // Store the ID change for database update
        idChanges.push({
          oldId: placeholder.id,
          newId
        });
        
        // Update the ID in the media map
        node.mediaPlaceholders[index].id = newId;
        
        console.log(`  Changed "${id}" to "${newId}"`);
      }
    }
    
    // Save the updated media map
    fs.writeFileSync(dataFilePath, JSON.stringify(mediaMap, null, 2));
    console.log(`Updated media map saved to ${dataFilePath}`);
    
    // Update the database if there are ID changes
    if (idChanges.length > 0) {
      console.log(`Updating ${idChanges.length} IDs in the database...`);
      
      for (const { oldId, newId } of idChanges) {
        // Update the placeholder ID in the media_placeholders table
        const { error: placeholderError } = await supabase
          .from('media_placeholders')
          .update({ id: newId })
          .eq('id', oldId);
        
        if (placeholderError) {
          console.error(`Error updating placeholder ${oldId}:`, placeholderError);
        } else {
          console.log(`Updated placeholder ID from "${oldId}" to "${newId}"`);
        }
        
        // Update the placeholder_id in the media_assets table
        const { error: assetError } = await supabase
          .from('media_assets')
          .update({ placeholder_id: newId })
          .eq('placeholder_id', oldId);
        
        if (assetError) {
          console.error(`Error updating asset for ${oldId}:`, assetError);
        } else {
          console.log(`Updated asset placeholder_id from "${oldId}" to "${newId}"`);
        }
      }
    }
    
    console.log('Duplicate IDs fixed successfully!');
  } catch (error) {
    console.error('Error fixing duplicate IDs:', error);
  }
}

// Run the script
fixDuplicateIds().catch(console.error); 