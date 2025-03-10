#!/usr/bin/env node

/**
 * Simple Fix for Media Assets
 * 
 * This script fixes the media_assets table by adding missing associations
 * between placeholders and Cloudinary assets, using the actual schema.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Map of placeholder IDs to actual Cloudinary IDs that exist in your account
// These are the key ones that should appear in the Visual Media Manager
const CLOUDINARY_MAPPING = {
  'home/hero': 'emsculpt/videos/hero/hero-720p-mp4', // Use an actual video that exists
  'home/about': 'team/headshots/allure%2520md%2520team-6TUXPQwPjawHW8XhzAkP2rYJ0mtpt6', // From about-section.tsx
  'services/banner': 'emsculpt/services/banner',
  'services/emsculpt': 'emsculpt/services/emsculpt',
  'about/team': 'team/group-photo',
  'contact/map': 'site/contact/map',
  'general/logo': 'site/logo/main-logo',
  'home/plastic-surgery': 'plastic-surgery/overview',
  'home/dermatology': 'dermatology/overview',
  'home/medical-spa': 'medical-spa/overview'
};

async function fixMediaAssets() {
  console.log('Fixing media assets with simplified approach...');
  
  // 1. Get all placeholders
  const { data: placeholders, error: placeholdersError } = await supabase
    .from('media_placeholders')
    .select('*');
  
  if (placeholdersError) {
    console.error('Error fetching media placeholders:', placeholdersError);
    return;
  }
  
  console.log(`Found ${placeholders.length} placeholders to process.`);
  
  // 2. Get existing assets
  const { data: existingAssets, error: assetsError } = await supabase
    .from('media_assets')
    .select('*');
  
  if (assetsError) {
    console.error('Error fetching media assets:', assetsError);
    return;
  }
  
  const existingAssetMap = new Map();
  existingAssets.forEach(asset => {
    existingAssetMap.set(asset.placeholder_id, asset);
  });
  
  // 3. Process each placeholder
  let updatedCount = 0;
  let createdCount = 0;
  
  for (const placeholder of placeholders) {
    const placeholderId = placeholder.id;
    const existingAsset = existingAssetMap.get(placeholderId);
    
    // Get a Cloudinary ID for this placeholder
    let cloudinaryId = CLOUDINARY_MAPPING[placeholderId];
    
    // If we don't have a specific mapping, generate a default one
    if (!cloudinaryId) {
      // For placeholders without a specific mapping, create a sensible default
      const area = placeholder.area || 'general';
      const path = placeholder.path || 'site';
      cloudinaryId = `${path}/${area}/placeholder-${placeholderId.replace(/\//g, '-')}`;
    }
    
    if (existingAsset) {
      // Update existing asset with the correct Cloudinary ID
      const { error: updateError } = await supabase
        .from('media_assets')
        .update({
          cloudinary_id: cloudinaryId
        })
        .eq('placeholder_id', placeholderId);
      
      if (updateError) {
        console.error(`Error updating asset for ${placeholderId}:`, updateError);
      } else {
        console.log(`Updated asset for ${placeholderId} to use ${cloudinaryId}`);
        updatedCount++;
      }
    } else {
      // Create a new asset
      const { error: insertError } = await supabase
        .from('media_assets')
        .insert({
          placeholder_id: placeholderId,
          cloudinary_id: cloudinaryId,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'system',
          metadata: {}
        });
      
      if (insertError) {
        console.error(`Error creating asset for ${placeholderId}:`, insertError);
      } else {
        console.log(`Created asset for ${placeholderId} using ${cloudinaryId}`);
        createdCount++;
      }
    }
  }
  
  console.log(`Media assets fix complete! Updated: ${updatedCount}, Created: ${createdCount}`);
}

fixMediaAssets().catch(console.error); 