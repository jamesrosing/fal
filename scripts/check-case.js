// Script to check if a case exists and print its details
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getCase(caseId) {
  if (!caseId) {
    console.error('Please provide a case ID as an argument');
    process.exit(1);
  }

  try {
    console.log(`Looking up case with ID: ${caseId}`);
    
    const { data, error } = await supabase
      .from('cases')
      .select('*, images(*), album:album_id(title, gallery:gallery_id(title))')
      .eq('id', caseId)
      .single();
    
    if (error) {
      console.error('Error fetching case:', error);
      process.exit(1);
    }
    
    if (!data) {
      console.log('No case found with that ID');
      process.exit(0);
    }
    
    console.log('Case found:');
    console.log('===========');
    console.log(`ID: ${data.id}`);
    console.log(`Title: ${data.title}`);
    console.log(`Description: ${data.description || 'None'}`);
    console.log(`Album: ${data.album?.title || 'Unknown'}`);
    console.log(`Collection: ${data.album?.gallery?.title || 'Unknown'}`);
    console.log(`Created at: ${data.created_at}`);
    console.log(`Images: ${data.images?.length || 0}`);
    
    if (data.images && data.images.length > 0) {
      console.log('\nImages:');
      data.images.forEach((img, i) => {
        console.log(`  ${i+1}. ${img.cloudinary_url}`);
        console.log(`     ID: ${img.id}`);
        console.log(`     Caption: ${img.caption || 'None'}`);
        console.log(`     Tags: ${img.tags?.join(', ') || 'None'}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Get the case ID from command line argument
const caseId = process.argv[2];
getCase(caseId); 