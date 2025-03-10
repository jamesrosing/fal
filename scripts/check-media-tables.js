#!/usr/bin/env node

/**
 * Check Media Tables
 * 
 * This script checks the media_placeholders and media_assets tables
 * to diagnose why media isn't showing up in the Visual Media Manager.
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

async function checkMediaTables() {
  console.log('Checking media tables...');
  
  // 1. Check media_placeholders table
  const { data: placeholders, error: placeholdersError } = await supabase
    .from('media_placeholders')
    .select('*')
    .limit(10);
  
  if (placeholdersError) {
    console.error('Error fetching media placeholders:', placeholdersError);
    return;
  }
  
  console.log(`Found ${placeholders.length} placeholders in media_placeholders table.`);
  console.log('Sample placeholders:');
  placeholders.slice(0, 3).forEach(p => console.log(p));
  
  // 2. Check media_assets table
  const { data: assets, error: assetsError } = await supabase
    .from('media_assets')
    .select('*')
    .limit(10);
  
  if (assetsError) {
    console.error('Error fetching media assets:', assetsError);
    return;
  }
  
  console.log(`\nFound ${assets.length} assets in media_assets table.`);
  console.log('Sample assets:');
  assets.slice(0, 3).forEach(a => console.log(a));
  
  // 3. Check for placeholders without assets
  const placeholderIds = placeholders.map(p => p.id);
  const assetPlaceholderIds = assets.map(a => a.placeholder_id);
  
  const missingAssets = placeholderIds.filter(id => !assetPlaceholderIds.includes(id));
  console.log(`\n${missingAssets.length} placeholders don't have associated assets.`);
  if (missingAssets.length > 0) {
    console.log('Sample missing placeholder IDs:');
    missingAssets.slice(0, 3).forEach(id => console.log(id));
  }
  
  // 4. Check for assets with invalid Cloudinary IDs
  console.log('\nChecking for potentially invalid Cloudinary IDs...');
  const suspiciousAssets = assets.filter(a => {
    const cloudinaryId = a.cloudinary_id;
    return !cloudinaryId || 
           cloudinaryId.includes('undefined') || 
           cloudinaryId.includes('null') ||
           cloudinaryId.length < 5;
  });
  
  console.log(`Found ${suspiciousAssets.length} assets with potentially invalid Cloudinary IDs.`);
  if (suspiciousAssets.length > 0) {
    console.log('Sample suspicious assets:');
    suspiciousAssets.slice(0, 3).forEach(a => console.log(a));
  }
}

checkMediaTables().catch(console.error); 