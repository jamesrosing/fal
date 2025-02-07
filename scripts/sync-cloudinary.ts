import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Verify environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in .env.local');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local');
}
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined in .env.local');
}
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not defined in .env.local');
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not defined in .env.local');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncCloudinaryImages() {
  try {
    // Get all images from Cloudinary's gallery folder
    const { resources } = await cloudinary.search
      .expression('folder:gallery/*')
      .with_field('context')
      .with_field('tags')
      .max_results(500)
      .execute();

    console.log(`Found ${resources.length} images in Cloudinary`);

    for (const resource of resources) {
      const { public_id, secure_url, context, tags } = resource;
      const pathParts = public_id.split('/');

      // Extract collection, album, and case from the path
      // Format: gallery/collection-name/album-name/case-number/image-name
      if (pathParts.length < 5) {
        console.warn(`Skipping ${public_id} - Invalid path structure`);
        continue;
      }

      const [_, collection, album, caseNumber] = pathParts;

      // Find album using case-insensitive match
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('id, title')
        .ilike('title', album)
        .single();

      if (albumError || !albumData) {
        console.warn(`Skipping ${public_id} - Album not found: ${album}`);
        continue;
      }

      // Find or create case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id')
        .eq('album_id', albumData.id)
        .eq('title', caseNumber)
        .single();

      let caseId;
      if (caseError || !caseData) {
        const { data: newCase, error: createError } = await supabase
          .from('cases')
          .insert({
            album_id: albumData.id,
            title: caseNumber,
            description: context?.description || '',
            metadata: context || {}
          })
          .select()
          .single();

        if (createError || !newCase) {
          console.error(`Failed to create case for ${public_id}:`, createError);
          continue;
        }
        caseId = newCase.id;
      } else {
        caseId = caseData.id;
      }

      // Create or update image record
      const { error: upsertError } = await supabase
        .from('images')
        .upsert({
          case_id: caseId,
          cloudinary_url: secure_url,
          caption: context?.caption || '',
          tags: tags || []
        }, {
          onConflict: 'case_id,cloudinary_url'
        });

      if (upsertError) {
        console.error(`Failed to upsert image ${public_id}:`, upsertError);
      } else {
        console.log(`Successfully synced ${public_id} to album "${albumData.title}"`);
      }
    }

    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncCloudinaryImages(); 