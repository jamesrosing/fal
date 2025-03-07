// Media System Diagnostic Script
// This script helps diagnose issues with media associations between
// the media map and Cloudinary images

const fs = require('fs');
const path = require('path');
const { getCloudinaryUrl, checkCloudinaryAsset } = require('../lib/cloudinary');

// Test media item IDs that should have images
const testMediaItems = [
  'featured-article-1',
  'featured-article-2',
  'featured-article-3',
  'home-hero-background'
];

async function runDiagnosis() {
  console.log('Media System Diagnosis');
  console.log('=====================');
  
  // 1. Check for the media map
  console.log('\n1. Media Map Check:');
  let mediaMap;
  try {
    // This is a stand-in for the API route - in production you'd use a fetch call
    const mediaMapPath = path.join(process.cwd(), 'app/api/site/media-map/data.json');
    if (fs.existsSync(mediaMapPath)) {
      mediaMap = JSON.parse(fs.readFileSync(mediaMapPath, 'utf8'));
      console.log('✅ Media map found');
    } else {
      console.log('❌ Media map file not found at:', mediaMapPath);
    }
  } catch (error) {
    console.log('❌ Error reading media map:', error.message);
  }
  
  // 2. Check for media assets storage
  console.log('\n2. Media Assets Storage Check:');
  let mediaAssets;
  try {
    // Check for a potential media assets file - adjust path as needed
    const mediaAssetsPath = path.join(process.cwd(), 'app/api/site/media-assets/data.json');
    if (fs.existsSync(mediaAssetsPath)) {
      mediaAssets = JSON.parse(fs.readFileSync(mediaAssetsPath, 'utf8'));
      console.log('✅ Media assets storage found');
      console.log(`Found ${Object.keys(mediaAssets).length} media asset entries`);
    } else {
      console.log('❌ Media assets file not found at:', mediaAssetsPath);
    }
  } catch (error) {
    console.log('❌ Error reading media assets:', error.message);
  }
  
  // 3. Check Cloudinary for test images
  console.log('\n3. Cloudinary Asset Check:');
  for (const mediaId of testMediaItems) {
    try {
      // Construct potential paths for the media item
      // This is a guess - you'll need to adjust based on your system
      const potentialPaths = [
        `home/articles/${mediaId}`,
        `home/${mediaId}`,
        mediaId
      ];
      
      let found = false;
      for (const path of potentialPaths) {
        const exists = await checkCloudinaryAsset(path);
        if (exists) {
          found = true;
          console.log(`✅ ${mediaId}: Found at "${path}"`);
          break;
        }
      }
      
      if (!found) {
        console.log(`❌ ${mediaId}: Not found in Cloudinary`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${mediaId}:`, error.message);
    }
  }
  
  // 4. Check for frontend components
  console.log('\n4. Frontend Component Check:');
  const componentPaths = [
    'components/FeaturedArticles.tsx',
    'components/home/FeaturedArticles.tsx',
    'app/page.tsx'
  ];
  
  for (const compPath of componentPaths) {
    const fullPath = path.join(process.cwd(), compPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      console.log(`✅ Found component: ${compPath}`);
      
      // Simple check for media-related code
      if (content.includes('getCloudinaryUrl') || 
          content.includes('featured-article') ||
          content.includes('CloudinaryImage')) {
        console.log(`✅ Component ${compPath} appears to use media assets`);
      } else {
        console.log(`❌ Component ${compPath} may not use media assets`);
      }
    } else {
      console.log(`❌ Component not found: ${compPath}`);
    }
  }
  
  console.log('\n=====================');
  console.log('Diagnosis complete. Based on the results, check:');
  console.log('1. Is there a proper mechanism to associate media map entries with Cloudinary assets?');
  console.log('2. Are frontend components properly retrieving these associations?');
  console.log('3. Are the Cloudinary assets being saved with the correct public IDs?');
}

runDiagnosis().catch(console.error); 