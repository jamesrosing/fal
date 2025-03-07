import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MEDIA_MAP_PATH = path.join(process.cwd(), 'app/api/site/media-map/data.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key are required. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to extract all placeholders from the media map
function extractPlaceholders(mediaMap) {
  const placeholders = [];
  
  mediaMap.forEach(section => {
    section.sections.forEach(area => {
      area.mediaPlaceholders.forEach(placeholder => {
        placeholders.push({
          id: placeholder.id,
          name: placeholder.name,
          description: placeholder.description,
          area: placeholder.area,
          path: placeholder.path,
          dimensions: placeholder.dimensions
        });
      });
    });
  });
  
  return placeholders;
}

// Main function to sync placeholders
async function syncMediaPlaceholders() {
  try {
    console.log('Reading media map...');
    
    // Check if the media map exists
    if (!fs.existsSync(MEDIA_MAP_PATH)) {
      console.error(`Error: Media map not found at ${MEDIA_MAP_PATH}`);
      console.error('Please run "npm run generate-media-map" first.');
      process.exit(1);
    }
    
    // Read and parse the media map
    const mediaMapData = fs.readFileSync(MEDIA_MAP_PATH, 'utf8');
    const mediaMap = JSON.parse(mediaMapData);
    
    if (!Array.isArray(mediaMap) || mediaMap.length === 0) {
      console.error('Error: Media map is empty or invalid.');
      process.exit(1);
    }
    
    // Extract placeholders
    const placeholders = extractPlaceholders(mediaMap);
    console.log(`Found ${placeholders.length} placeholders in the media map.`);
    
    // Check if the media_placeholders table exists
    const { error: tableCheckError } = await supabase
      .from('media_placeholders')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.error('Error: Could not access the media_placeholders table.');
      console.error('Please make sure the table exists and you have the correct permissions.');
      console.error('Error details:', tableCheckError.message);
      process.exit(1);
    }
    
    // Sync placeholders to Supabase
    console.log('Syncing placeholders to Supabase...');
    
    // Process in batches to avoid rate limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < placeholders.length; i += BATCH_SIZE) {
      const batch = placeholders.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from('media_placeholders')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error upserting batch ${i / BATCH_SIZE + 1}:`, error);
      } else {
        console.log(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(placeholders.length / BATCH_SIZE)}`);
      }
    }
    
    console.log('Sync complete!');
    console.log(`Synced ${placeholders.length} placeholders to Supabase.`);
  } catch (error) {
    console.error('Error syncing media placeholders:', error);
    process.exit(1);
  }
}

// Run the sync
syncMediaPlaceholders(); 