/**
 * Test Script for Cloudinary Implementation
 * 
 * This script tests Cloudinary URL generation to verify it's working correctly.
 * 
 * Run with: node scripts/test-cloudinary.js
 */

// Test Cloudinary URL generation
function createCloudinaryUrl(publicId, transformations = []) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  
  // Base URL
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Add transformations
  if (transformations.length > 0) {
    const transformationString = transformations
      .map(transform => {
        return Object.entries(transform)
          .map(([key, value]) => {
            // Handle nested objects like overlay
            if (key === 'overlay' && typeof value === 'object') {
              return `l_${value.public_id || 'text:' + encodeURIComponent(value.text || '')}`;
            }
            // Handle standard transformations
            return `${key.replace(/_/g, '-')}${value ? '_' + value : ''}`;
          })
          .join(',');
      })
      .join('/');
    
    url += '/' + transformationString;
  }
  
  // Add public ID
  url += '/' + publicId;
  
  return url;
}

function generateArticleOgImage(title, imagePublicId, logoPublicId) {
  const transformations = [
    { w: 1200, h: 630, c: 'fill' },
    { 
      overlay: { text: encodeURIComponent(title) },
      font_family: 'Arial',
      font_size: 60,
      font_weight: 'bold',
      color: 'white',
      gravity: 'center'
    }
  ];
  
  if (logoPublicId) {
    transformations.push({
      overlay: { public_id: logoPublicId },
      gravity: 'south_east',
      opacity: 80
    });
  }
  
  transformations.push({ f: 'auto', q: 'auto' });
  
  return createCloudinaryUrl(imagePublicId, transformations);
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
}

async function runTests() {
  try {
    console.log('\n======= CLOUDINARY IMPLEMENTATION TESTS =======\n');
    
    // Test OG Image generation
    testOgImages();
    
    console.log('\n======= TESTS COMPLETED =======\n');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run all tests
runTests().catch(console.error); 