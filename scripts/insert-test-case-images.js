/**
 * Script to insert test case images for a given case ID
 * This will create 5 test images with the standard views:
 * 1. Front AP
 * 2. Oblique Left
 * 3. Oblique Right
 * 4. Profile Left
 * 5. Profile Right
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestCaseImages(caseId) {
  if (!caseId) {
    console.error('Error: Case ID is required');
    console.log('Usage: node insert-test-case-images.js <caseId>');
    process.exit(1);
  }

  console.log(`Inserting test images for case: ${caseId}`);

  try {
    // First, check if the case exists
    const { data: caseExists, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseExists) {
      console.error(`Error: Case ${caseId} not found.`);
      process.exit(1);
    }

    // Delete any existing case_images for this case
    const { error: deleteError } = await supabase
      .from('case_images')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      console.error('Error deleting existing case images:', deleteError);
      process.exit(1);
    }

    // Standard views
    const standardViews = [
      'front',           // Front AP
      'oblique-left',    // Oblique Left
      'oblique-right',   // Oblique Right
      'profile-left',    // Profile Left
      'profile-right'    // Profile Right
    ];

    // Insert 5 test images
    const imagesToInsert = standardViews.map((view, index) => ({
      case_id: caseId,
      media_id: `test-media-${index}`, // This field won't be used but is required
      sequence: index.toString(),
      // Additional metadata could be added here
    }));

    const { data: insertedImages, error: insertError } = await supabase
      .from('case_images')
      .insert(imagesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting test case images:', insertError);
      process.exit(1);
    }

    console.log(`Successfully inserted ${insertedImages.length} test case images:`);
    console.table(insertedImages.map((img, i) => ({
      id: img.id,
      sequence: img.sequence,
      view: standardViews[i]
    })));

    console.log('\nTest your gallery at:');
    console.log(`http://localhost:3000/gallery/collection/album/${caseId}`);
    
    console.log('\nCloudinary public IDs that will be used:');
    insertedImages.forEach((img, i) => {
      console.log(`${i}. ${standardViews[i]}: gallery/case-images/${caseId}/${i}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Get caseId from command line arguments
const caseId = process.argv[2];
insertTestCaseImages(caseId);