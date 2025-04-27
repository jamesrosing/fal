import { getMediaUrl } from '../../lib/media/utils';
import mediaRegistry from '../../lib/media/registry';
import fs from 'fs';
import path from 'path';

async function checkMediaAsset(id: string): Promise<boolean> {
  try {
    const url = getMediaUrl(id);
    
    // Skip placeholder URLs
    if (url.includes('placeholder.com')) {
      console.error(`❌ Asset ${id} resolves to a placeholder image`);
      return false;
    }
    
    // Try to fetch the URL
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) {
      console.error(`❌ Asset ${id} returned status ${response.status} from URL ${url}`);
      return false;
    }
    
    console.log(`✅ Asset ${id} is accessible`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking asset ${id}:`, error);
    return false;
  }
}

async function main() {
  // Get all registered assets
  const assets = mediaRegistry.getAllAssets();
  
  console.log(`Found ${assets.length} registered media assets`);
  
  // Check each asset
  let validCount = 0;
  let invalidCount = 0;
  
  for (const asset of assets) {
    const isValid = await checkMediaAsset(asset.id);
    
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }
  
  // Write report
  const report = {
    totalAssets: assets.length,
    validAssets: validCount,
    invalidAssets: invalidCount,
    verificationDate: new Date().toISOString(),
    assetsByType: {
      image: assets.filter(a => a.type === 'image').length,
      video: assets.filter(a => a.type === 'video').length
    },
    assetsByArea: assets.reduce((acc, asset) => {
      acc[asset.area] = (acc[asset.area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'media-verification-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\nVerification Summary:');
  console.log(`Total assets: ${assets.length}`);
  console.log(`Valid assets: ${validCount}`);
  console.log(`Invalid assets: ${invalidCount}`);
  console.log(`Success rate: ${((validCount / assets.length) * 100).toFixed(2)}%`);
  console.log('\nDetailed report written to media-verification-report.json');
}

// Run the verification
main().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
}); 