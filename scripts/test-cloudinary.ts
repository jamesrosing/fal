/**
 * Test Script for Cloudinary Implementation
 * 
 * This script tests various Cloudinary utilities to verify they're working correctly.
 * 
 * Run with: npx ts-node scripts/test-cloudinary.ts
 */

import { generateArticleOgImage, generateGalleryOgImage } from '../lib/cloudinary/og-image';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure Cloudinary cloud name is set
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'dyrzyfg3w';
}

function testOgImages() {
  console.log('Testing OG Image Generation:');
  
  // Test article OG image
  const articleOgUrl = generateArticleOgImage(
    'Testing Article Title with Special Characters: & ? #',
    'samples/cloudinary-logo',
    'samples/cloudinary-icon'
  );
  
  console.log('\nArticle OG Image URL:');
  console.log(articleOgUrl);
  
  // Test gallery OG image
  const galleryOgUrl = generateGalleryOgImage(
    'Gallery Test Example',
    ['samples/animals/cat', 'samples/animals/dog'],
    'samples/cloudinary-icon'
  );
  
  console.log('\nGallery OG Image URL:');
  console.log(galleryOgUrl);
}

async function runTests() {
  try {
    console.log('\n======= CLOUDINARY IMPLEMENTATION TESTS =======\n');
    
    // Test OG Image generation
    testOgImages();
    
    // Add more tests as needed
    
    console.log('\n======= TESTS COMPLETED =======\n');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run all tests
runTests().catch(console.error); 