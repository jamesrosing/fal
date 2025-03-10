#!/usr/bin/env node

/**
 * Check Media Schema
 * 
 * This script checks the actual schema of the media_assets table
 * to understand what columns are available.
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

async function checkMediaSchema() {
  console.log('Checking media_assets table schema...');
  
  // Get a sample row to see the columns
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching from media_assets:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns in media_assets table:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No data found in media_assets table.');
  }
  
  // Try to get the table definition
  try {
    const { data: definition, error: defError } = await supabase
      .rpc('get_table_definition', { table_name: 'media_assets' });
    
    if (defError) {
      console.error('Error getting table definition:', defError);
    } else if (definition) {
      console.log('Table definition:');
      console.log(definition);
    }
  } catch (e) {
    console.log('RPC method not available, trying a different approach...');
  }
  
  // Create a simplified fix script based on the actual schema
  console.log('\nSimplified fix script:');
  console.log(`
// Update the existing asset
const { error: updateError } = await supabase
  .from('media_assets')
  .update({
    cloudinary_id: 'your-cloudinary-id'
  })
  .eq('placeholder_id', 'placeholder-id');

// Create a new asset
const { error: insertError } = await supabase
  .from('media_assets')
  .insert({
    placeholder_id: 'placeholder-id',
    cloudinary_id: 'your-cloudinary-id'
  });
  `);
}

checkMediaSchema().catch(console.error); 