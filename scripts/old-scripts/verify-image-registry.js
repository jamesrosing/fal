import fs from 'fs';
import { createRequire } from 'module';

// Use createRequire to import JSON
const require = createRequire(import.meta.url);
const replacementMap = require('../../cloudinary-replacement-map.json');

// Cloud name from environment
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';

async function checkCloudinaryUrl(id, publicId) {
  try {
    // Look for the full URL in the replacement map
    const matchingUrl = Object.entries(replacementMap).find(([url, data]) => {
      return data.publicId === publicId;
    });
    
    // Use the actual URL from the replacement map if found
    const url = matchingUrl ? matchingUrl[0] : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
    
    // Try to fetch the URL
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      console.error(`❌ Asset ${id} returned status ${response.status} from URL ${url}`);
      return { success: false, status: response.status, url };
    }
    
    console.log(`✅ Asset ${id} is accessible at ${url}`);
    return { success: true, url };
  } catch (error) {
    console.error(`❌ Error checking asset ${id}:`, error);
    return { success: false, error };
  }
}

async function main() {
  try {
    // Import the IMAGE_ASSETS object dynamically
    const imageConfigModule = await import('../../lib/image-config.js');
    const IMAGE_ASSETS = imageConfigModule.IMAGE_ASSETS;
    
    // Get all registered assets
    const assets = Object.values(IMAGE_ASSETS);
    
    console.log(`\nFound ${assets.length} registered media assets`);
    
    // Check each asset
    let validCount = 0;
    let invalidCount = 0;
    let results = [];
    
    for (const asset of assets) {
      console.log(`Checking ${asset.id}...`);
      const result = await checkCloudinaryUrl(asset.id, asset.publicId);
      
      // Store result
      results.push({
        id: asset.id,
        publicId: asset.publicId,
        success: result.success,
        url: result.url,
        ...(result.status && { status: result.status }),
        ...(result.error && { error: String(result.error) })
      });
      
      if (result.success) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
    
    // Write detailed report
    const report = {
      totalAssets: assets.length,
      validAssets: validCount,
      invalidAssets: invalidCount,
      verificationDate: new Date().toISOString(),
      successRate: `${((validCount / assets.length) * 100).toFixed(2)}%`,
      assetResults: results
    };
    
    fs.writeFileSync(
      'media-verification-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\nVerification Summary:');
    console.log(`Total assets: ${assets.length}`);
    console.log(`Valid assets: ${validCount}`);
    console.log(`Invalid assets: ${invalidCount}`);
    console.log(`Success rate: ${((validCount / assets.length) * 100).toFixed(2)}%`);
    console.log('\nDetailed report written to media-verification-report.json');
    
    // Check assets by category
    const assetsByType = {
      image: assets.filter(a => a.type === 'image').length,
      video: assets.filter(a => a.type === 'video').length
    };
    
    const assetsByArea = assets.reduce((acc, asset) => {
      acc[asset.area] = (acc[asset.area] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nAssets by type:');
    console.log(assetsByType);
    
    console.log('\nAssets by area:');
    console.log(assetsByArea);
    
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
main();