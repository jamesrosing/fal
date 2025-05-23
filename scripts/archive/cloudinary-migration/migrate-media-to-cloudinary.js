// scripts/migrate-media-to-cloudinary.js
import { createClient, IMAGE_ASSETS } from './supabase-adapter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateMediaToCloudinary() {
  console.log('Starting media migration to Cloudinary...');
  const supabase = createClient();
  
  // 1. Migrate static registry assets
  console.log('Migrating static registry assets...');
  const staticMigrations = [];
  
  for (const [id, asset] of Object.entries(IMAGE_ASSETS)) {
    console.log(`Preparing static asset: ${id}`);
    
    staticMigrations.push({
      public_id: asset.publicId,
      type: asset.type || 'image',
      title: asset.description,
      alt_text: asset.description,
      width: asset.dimensions?.width,
      height: asset.dimensions?.height,
      metadata: {
        legacy_id: id,
        area: asset.area,
        defaultOptions: asset.defaultOptions
      }
    });
  }
  
  // Batch insert static assets in chunks to avoid payload size limitations
  const CHUNK_SIZE = 50;
  for (let i = 0; i < staticMigrations.length; i += CHUNK_SIZE) {
    const chunk = staticMigrations.slice(i, i + CHUNK_SIZE);
    console.log(`Migrating static assets chunk ${i/CHUNK_SIZE + 1} of ${Math.ceil(staticMigrations.length/CHUNK_SIZE)}`);
    
    const { error } = await supabase
      .from('media_assets')
      .upsert(chunk, { onConflict: 'public_id' });
      
    if (error) {
      console.error(`Error migrating static assets chunk ${i/CHUNK_SIZE + 1}:`, error);
    } else {
      console.log(`Successfully migrated ${chunk.length} static assets in chunk ${i/CHUNK_SIZE + 1}`);
    }
  }
  
  // 2. Check if legacy table exists and migrate if it does
  console.log('Checking for legacy media_assets_old table...');
  const { error: tableCheckError } = await supabase
    .from('media_assets_old')
    .select('count(*)', { count: 'exact' })
    .limit(1);
  
  if (!tableCheckError) {
    console.log('Found legacy media_assets_old table, migrating records...');
    
    // Fetch existing placeholders
    const { data: existingAssets, error: fetchError } = await supabase
      .from('media_assets_old')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching existing assets:', fetchError);
    } else {
      console.log(`Found ${existingAssets?.length || 0} legacy assets to migrate`);
      
      const placeholderMigrations = (existingAssets || []).map(asset => ({
        public_id: asset.cloudinary_id,
        type: asset.cloudinary_id.includes('video') ? 'video' : 'image',
        title: asset.metadata?.title || asset.placeholder_id,
        alt_text: asset.metadata?.alt_text || asset.placeholder_id,
        metadata: {
          ...asset.metadata,
          legacy_placeholder_id: asset.placeholder_id
        },
        created_at: asset.uploaded_at,
        updated_at: new Date().toISOString()
      }));
      
      // Batch insert placeholder assets in chunks
      for (let i = 0; i < placeholderMigrations.length; i += CHUNK_SIZE) {
        const chunk = placeholderMigrations.slice(i, i + CHUNK_SIZE);
        console.log(`Migrating placeholder assets chunk ${i/CHUNK_SIZE + 1} of ${Math.ceil(placeholderMigrations.length/CHUNK_SIZE)}`);
        
        const { error: placeholderError } = await supabase
          .from('media_assets')
          .upsert(chunk, { onConflict: 'public_id' });
          
        if (placeholderError) {
          console.error(`Error migrating placeholder assets chunk ${i/CHUNK_SIZE + 1}:`, placeholderError);
        } else {
          console.log(`Successfully migrated ${chunk.length} placeholder assets in chunk ${i/CHUNK_SIZE + 1}`);
        }
      }
    }
  } else {
    console.log('No legacy media_assets_old table found, skipping this step');
  }
  
  // 3. Generate publicId mapping file for migration script
  console.log('Generating publicId mapping file...');
  const mappings = {};
  
  // Add mappings from static registry
  Object.entries(IMAGE_ASSETS).forEach(([id, asset]) => {
    mappings[id] = asset.publicId;
  });
  
  // Add placeholder mappings from database if available
  if (!tableCheckError) {
    const { data: placeholders } = await supabase
      .from('media_assets_old')
      .select('placeholder_id, cloudinary_id');
      
    if (placeholders && placeholders.length > 0) {
      placeholders.forEach(placeholder => {
        mappings[placeholder.placeholder_id] = placeholder.cloudinary_id;
      });
    }
  }
  
  // Write mapping file
  fs.writeFileSync(
    path.join(process.cwd(), 'cloudinary-replacement-map.json'), 
    JSON.stringify(mappings, null, 2)
  );
  
  console.log(`Generated mapping file with ${Object.keys(mappings).length} entries`);
  console.log('Migration completed!');
}

// Self-executing function
(async () => {
  try {
    await migrateMediaToCloudinary();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})(); 