/**
 * Database Schema Migration Script
 * 
 * This script migrates the media_assets table to focus on public_id as the primary identifier
 * and removes placeholder-based references.
 * 
 * It creates a backup of existing data, updates the schema, and migrates data to the new structure.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping of placeholder IDs to Cloudinary public IDs
// This will store the extracted mappings
let placeholderToPublicId = {};

// Function to extract placeholder to public ID mappings
async function extractMappings() {
  console.log('Extracting placeholder to publicId mappings...');
  
  // Query old table structure
  const { data, error } = await supabase
    .from('media_assets')
    .select('*');
  
  if (error) {
    console.error('Error extracting mappings:', error);
    return;
  }
  
  console.log(`Found ${data.length} media assets`);
  
  // Extract mappings
  const mappings = {};
  
  for (const asset of data) {
    // Check different possible fields based on the current schema
    const placeholderId = asset.placeholder_id;
    const publicId = asset.public_id || asset.cloudinary_id;
    
    if (placeholderId && publicId) {
      mappings[placeholderId] = publicId;
    }
  }
  
  // Save mappings to file for reference
  await fs.writeFile(
    path.join(process.cwd(), 'placeholder-to-publicid-mappings.json'),
    JSON.stringify(mappings, null, 2),
    'utf8'
  );
  
  console.log(`Saved ${Object.keys(mappings).length} mappings to placeholder-to-publicid-mappings.json`);
  
  placeholderToPublicId = mappings;
}

// Function to backup the current data
async function backupCurrentData() {
  console.log('Creating backup of current media_assets table...');
  
  // Query all data from the table
  const { data, error } = await supabase
    .from('media_assets')
    .select('*');
  
  if (error) {
    console.error('Error fetching data for backup:', error);
    return;
  }
  
  // Save to backup file
  const backupFilename = `media-assets-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await fs.writeFile(
    path.join(process.cwd(), backupFilename),
    JSON.stringify(data, null, 2),
    'utf8'
  );
  
  console.log(`Backup saved to ${backupFilename}`);
  
  return data;
}

// Function to update the database schema
async function updateSchema() {
  console.log('Updating database schema...');
  
  // SQL to update the schema
  // This is an example that handles a specific case - adjust to your actual schema
  const sql = `
    -- First, ensure we have a backup of the current table
    CREATE TABLE IF NOT EXISTS media_assets_backup AS SELECT * FROM media_assets;
    
    -- Add new columns if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'public_id') THEN
        ALTER TABLE media_assets ADD COLUMN public_id TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'type') THEN
        ALTER TABLE media_assets ADD COLUMN type TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'width') THEN
        ALTER TABLE media_assets ADD COLUMN width INT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'height') THEN
        ALTER TABLE media_assets ADD COLUMN height INT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'alt_text') THEN
        ALTER TABLE media_assets ADD COLUMN alt_text TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'title') THEN
        ALTER TABLE media_assets ADD COLUMN title TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_assets' AND column_name = 'metadata') THEN
        ALTER TABLE media_assets ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
      END IF;
    END $$;
    
    -- Create index on public_id
    CREATE INDEX IF NOT EXISTS idx_media_assets_public_id ON media_assets(public_id);
  `;
  
  // Execute the SQL (use RPC for complex queries)
  const { error } = await supabase.rpc('execute_sql', { sql_string: sql });
  
  if (error) {
    console.error('Error updating schema:', error);
    return false;
  }
  
  console.log('Schema updated successfully');
  return true;
}

// Function to migrate data to the new structure
async function migrateData(backupData) {
  console.log('Migrating data to new schema...');
  
  // Migrate in chunks to avoid timeouts
  const chunkSize = 50;
  
  for (let i = 0; i < backupData.length; i += chunkSize) {
    const chunk = backupData.slice(i, i + chunkSize);
    const updates = [];
    
    for (const asset of chunk) {
      // Skip already migrated records
      if (asset.public_id) {
        continue;
      }
      
      // Determine public_id from cloudinary_id or placeholder mapping
      let publicId = asset.cloudinary_id;
      
      if (!publicId && asset.placeholder_id) {
        publicId = placeholderToPublicId[asset.placeholder_id];
      }
      
      if (!publicId) {
        console.warn(`No public_id found for asset ID ${asset.id}`);
        continue;
      }
      
      // Set a default type based on the publicId
      const type = publicId.includes('/video/') || /\.(mp4|mov|avi|webm)$/i.test(publicId)
        ? 'video'
        : 'image';
      
      // Create update object
      updates.push({
        id: asset.id,
        public_id: publicId,
        type: type,
        // Add any legacy placeholder ID to metadata for reference
        metadata: {
          ...asset.metadata || {},
          legacy_placeholder_id: asset.placeholder_id || null
        }
      });
    }
    
    // Update records in batch
    if (updates.length > 0) {
      const { error } = await supabase
        .from('media_assets')
        .upsert(updates);
      
      if (error) {
        console.error(`Error updating chunk ${i}-${i+chunkSize}:`, error);
      } else {
        console.log(`Updated ${updates.length} records in chunk ${i}-${i+chunkSize}`);
      }
    }
  }
  
  console.log('Data migration completed');
}

// Main migration function
async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // First extract mappings
    await extractMappings();
    
    // Backup current data
    const backupData = await backupCurrentData();
    
    if (!backupData) {
      console.error('Failed to backup data, aborting migration');
      return;
    }
    
    // Update schema
    const schemaUpdated = await updateSchema();
    
    if (!schemaUpdated) {
      console.error('Failed to update schema, aborting migration');
      return;
    }
    
    // Migrate data
    await migrateData(backupData);
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error in database migration:', error);
  }
}

// Run the migration
migrateDatabase();