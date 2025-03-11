/**
 * Script to seed initial media assets in Supabase
 * 
 * Run with: npx ts-node scripts/seed-media-assets.ts
 */

import { createClient } from '../lib/supabase';

// Initial media assets to seed
const initialMediaAssets = [
  {
    placeholder_id: 'Out of Town Patients',
    cloudinary_id: 'hero/out-of-town-hero',
    metadata: { type: 'hero' }
  },
  {
    placeholder_id: 'Pendry Newport Beach',
    cloudinary_id: 'gallery/pendry-newport-beach',
    metadata: { type: 'location' }
  },
  {
    placeholder_id: 'The Resort at Pelican Hill',
    cloudinary_id: 'gallery/pelican-hill-resort',
    metadata: { type: 'location' }
  },
  {
    placeholder_id: 'Lido House, Autograph Collection',
    cloudinary_id: 'gallery/lido-house',
    metadata: { type: 'location' }
  }
];

async function seedMediaAssets() {
  try {
    console.log('Seeding media assets...');
    const supabase = createClient();
    
    // Insert media assets
    const { data, error } = await supabase
      .from('media_assets')
      .upsert(
        initialMediaAssets.map(asset => ({
          placeholder_id: asset.placeholder_id,
          cloudinary_id: asset.cloudinary_id,
          metadata: asset.metadata,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'system'
        })),
        { onConflict: 'placeholder_id' }
      );
    
    if (error) {
      console.error('Error seeding media assets:', error);
      return;
    }
    
    console.log('Media assets seeded successfully!');
  } catch (error) {
    console.error('Error in seed script:', error);
  }
}

// Run the seed function
seedMediaAssets(); 