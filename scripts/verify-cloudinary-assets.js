import { checkCloudinaryAsset } from '../lib/cloudinary.js';

const requiredAssets = [
  'hero/hero-poster',
  'hero/hero-fallback',
  'hero/hero-articles'
];

async function verifyAssets() {
  console.log('Verifying required Cloudinary assets...');
  
  for (const asset of requiredAssets) {
    const exists = await checkCloudinaryAsset(asset);
    console.log(`${asset}: ${exists ? '✅ Found' : '❌ Missing'}`);
    
    if (!exists) {
      console.log(`Please upload ${asset} to Cloudinary`);
      console.log(`Expected path: ${asset}`);
      console.log('---');
    }
  }
}

verifyAssets().catch(console.error); 