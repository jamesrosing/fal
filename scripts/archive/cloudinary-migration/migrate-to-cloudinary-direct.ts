/**
 * Migration Script: Convert from placeholder system to direct Cloudinary public IDs
 * 
 * This script:
 * 1. Moves data from old placeholder-based system to the new direct public ID system
 * 2. Creates or updates entries in the media_assets table
 * 3. Preserves metadata from the placeholder system
 * 
 * Run with: npx ts-node scripts/migrate-to-cloudinary-direct.ts
 */

import { createClient } from '@/lib/supabase';
import dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

// Ensure Cloudinary cloud name is set
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'dyrzyfg3w';
}

interface MediaPlaceholder {
  id: string;
  name: string;
  description?: string;
  area: string;
  path: string;
  dimensions: {
    width?: number;
    height?: number;
  };
  media_type: 'image' | 'video';
}

interface OldMediaAsset {
  placeholder_id: string;
  cloudinary_id: string;
  uploaded_at: string;
  uploaded_by?: string;
  metadata: Record<string, any>;
}

async function migrateMediaAssets() {
  try {
    console.log('Starting migration of media assets...');
    const supabase = createClient();
    
    // Get all placeholder definitions
    console.log('Fetching media placeholders...');
    const { data: placeholders, error: placeholdersError } = await supabase
      .from('media_placeholders')
      .select('*');
    
    if (placeholdersError || !placeholders) {
      throw new Error(`Error fetching placeholders: ${placeholdersError?.message}`);
    }
    
    console.log(`Found ${placeholders.length} placeholders to migrate.`);
    
    // Get all existing media asset mappings
    console.log('Fetching existing media assets...');
    const { data: oldAssets, error: assetsError } = await supabase
      .from('media_assets_old')
      .select('*');
    
    if (assetsError || !oldAssets) {
      throw new Error(`Error fetching old media assets: ${assetsError?.message}`);
    }
    
    console.log(`Found ${oldAssets.length} media assets to migrate.`);
    
    // Try to load static registry from image-config.js
    let staticRegistry: Record<string, any> = {};
    try {
      // Try to find and load the image-config.js file
      // This is just for reference and may not be needed if all assets are in the database
      const imageConfigPath = join(process.cwd(), 'lib', 'image-config.js');
      const imageConfigContent = readFileSync(imageConfigPath, 'utf8');
      const match = imageConfigContent.match(/export const IMAGE_ASSETS = ({[\s\S]+});/);
      if (match && match[1]) {
        const assetSrc = match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
        staticRegistry = JSON.parse(assetSrc);
        console.log(`Loaded static registry with ${Object.keys(staticRegistry).length} entries.`);
      }
    } catch (err) {
      console.log('Could not load static registry, continuing with database assets only.');
    }
    
    // Create a mapping of placeholder IDs to their Cloudinary IDs
    const assetMap: Map<string, { cloudinaryId: string, metadata: any }> = new Map();
    
    // First, add assets from the database
    oldAssets.forEach(asset => {
      assetMap.set(asset.placeholder_id, {
        cloudinaryId: asset.cloudinary_id,
        metadata: asset.metadata || {}
      });
    });
    
    // Next, add any assets from the static registry that aren't already in the database
    Object.entries(staticRegistry).forEach(([id, details]: [string, any]) => {
      if (!assetMap.has(id) && details.publicId) {
        assetMap.set(id, {
          cloudinaryId: details.publicId,
          metadata: {
            dimensions: details.dimensions,
            description: details.description,
            area: details.area
          }
        });
      }
    });
    
    console.log(`Created mapping for ${assetMap.size} assets.`);
    
    // Start migrating assets
    console.log('Beginning migration to new media_assets table...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const placeholder of placeholders) {
      try {
        const assetDetails = assetMap.get(placeholder.id);
        
        if (!assetDetails) {
          console.warn(`No Cloudinary ID found for placeholder ${placeholder.id}, skipping.`);
          continue;
        }
        
        const { cloudinaryId, metadata } = assetDetails;
        
        // Determine asset type
        const isVideo = placeholder.media_type === 'video' || 
                        cloudinaryId.includes('/video/') || 
                        /\.(mp4|webm|avi|mov|wmv)$/i.test(cloudinaryId);
        
        // Insert into new media_assets table
        const { error: insertError } = await supabase
          .from('media_assets')
          .insert({
            public_id: cloudinaryId,
            type: isVideo ? 'video' : 'image',
            title: placeholder.name || placeholder.description || placeholder.id,
            alt_text: placeholder.description || placeholder.name || placeholder.id,
            width: placeholder.dimensions?.width,
            height: placeholder.dimensions?.height,
            metadata: {
              legacy_placeholder_id: placeholder.id,
              area: placeholder.area,
              path: placeholder.path,
              ...metadata
            }
          })
          .select()
          .single();
        
        if (insertError) {
          if (insertError.message.includes('duplicate key')) {
            console.log(`Asset ${cloudinaryId} already exists, skipping.`);
          } else {
            console.error(`Error inserting asset for ${placeholder.id}:`, insertError);
            errorCount++;
          }
        } else {
          console.log(`Migrated ${placeholder.id} → ${cloudinaryId}`);
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing placeholder ${placeholder.id}:`, err);
        errorCount++;
      }
    }
    
    console.log('\nMigration Summary:');
    console.log(`- Total placeholders: ${placeholders.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Errors: ${errorCount}`);
    console.log(`- Skipped: ${placeholders.length - successCount - errorCount}`);
    
    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateMediaAssets().catch(console.error); 