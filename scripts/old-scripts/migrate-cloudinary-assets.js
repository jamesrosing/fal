import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local found, trying .env');
  dotenv.config();
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define mappings from current structure to new structure
const folderMappings = {
  'services-plastic-surgery': 'home/services/plastic-surgery',
  'services-dermatology': 'home/services/dermatology',
  'medical-spa': 'home/services/medical-spa',
  'plastic-surgery': 'home/services/plastic-surgery',
  'hero': 'home/hero',
  'logos': 'home/logos',
  'team': 'home/team'
  // Add more mappings as needed
};

async function listAllAssets() {
  let allAssets = [];
  let nextCursor;
  
  do {
    const result = await cloudinary.api.resources({
      max_results: 500,
      next_cursor: nextCursor,
      resource_type: 'image'
    });
    
    allAssets = [...allAssets, ...result.resources];
    nextCursor = result.next_cursor;
    
    console.log(`Fetched ${result.resources.length} assets, total: ${allAssets.length}`);
  } while (nextCursor);
  
  // Also fetch videos
  let nextVideoCursor;
  do {
    const result = await cloudinary.api.resources({
      max_results: 500,
      next_cursor: nextVideoCursor,
      resource_type: 'video'
    });
    
    allAssets = [...allAssets, ...result.resources];
    nextVideoCursor = result.next_cursor;
    
    console.log(`Fetched ${result.resources.length} video assets, new total: ${allAssets.length}`);
  } while (nextVideoCursor);
  
  return allAssets;
}

async function migrateAssets() {
  console.log('Starting asset migration...');
  console.log(`Using cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  
  // Get all assets
  const assets = await listAllAssets();
  console.log(`Found ${assets.length} assets to process`);
  
  // Keep track of migration results
  const results = {
    success: 0,
    skipped: 0,
    failed: 0
  };
  
  // Process each asset
  for (const asset of assets) {
    // Skip assets that are already in the new structure
    if (asset.public_id.startsWith('home/')) {
      console.log(`Skipping already migrated asset: ${asset.public_id}`);
      results.skipped++;
      continue;
    }
    
    // Find the right mapping for this asset
    let newPublicId = null;
    
    for (const [oldPrefix, newPrefix] of Object.entries(folderMappings)) {
      if (asset.public_id === oldPrefix || 
          asset.public_id.startsWith(`${oldPrefix}/`) || 
          asset.folder === oldPrefix) {
        // Replace old prefix with new prefix
        newPublicId = asset.public_id.replace(
          asset.public_id.startsWith(oldPrefix) ? oldPrefix : asset.folder, 
          newPrefix
        );
        break;
      }
    }
    
    // If no mapping found, skip
    if (!newPublicId) {
      console.log(`No mapping found for: ${asset.public_id}`);
      results.skipped++;
      continue;
    }
    
    // Copy to new location
    try {
      console.log(`Migrating: ${asset.public_id} -> ${newPublicId}`);
      
      await cloudinary.uploader.rename(
        asset.public_id, 
        newPublicId,
        { resource_type: asset.resource_type || 'image' }
      );
      
      console.log(`✓ Migrated: ${asset.public_id} -> ${newPublicId}`);
      results.success++;
    } catch (error) {
      console.error(`✗ Error migrating ${asset.public_id}:`, error);
      results.failed++;
    }
  }
  
  // Output results
  console.log('\nMigration complete!');
  console.log(`Successfully migrated: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
}

// Run the migration
migrateAssets().catch(console.error); 