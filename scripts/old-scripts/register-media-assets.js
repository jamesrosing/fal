import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { DIRECTORY_STRUCTURE } from '../../lib/media/structure.js';

// Asset type detection based on file extension
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];

/**
 * Scans a directory for media assets
 */
async function scanDirectory(dirPath, prefix = '', options = {}) {
  const { 
    mediaArea = null,
    baseId = null
  } = options;
  
  const imageGlob = imageExtensions.map(ext => `${dirPath}/**/*${ext}`);
  const videoGlob = videoExtensions.map(ext => `${dirPath}/**/*${ext}`);
  
  // Find all files matching patterns
  const imageFiles = await glob(imageGlob);
  const videoFiles = await glob(videoGlob);
  
  const assets = [];
  
  // Process image files
  for (const file of imageFiles) {
    const relativePath = file.replace(dirPath, '').replace(/\\/g, '/').replace(/^\//, '');
    const extension = path.extname(file).toLowerCase();
    const fileName = path.basename(file, extension);
    
    // Generate a unique ID based on path
    const id = baseId 
      ? `${baseId}-${fileName.replace(/[^a-z0-9]/gi, '-')}`
      : fileName.replace(/[^a-z0-9]/gi, '-');
    
    const publicId = prefix + relativePath.replace(extension, '');
    
    // Create asset entry
    const asset = {
      id,
      type: 'image',
      area: mediaArea || 'undefined',
      description: fileName.replace(/-/g, ' '),
      publicId,
      dimensions: {
        width: 800,
        height: 600,
        aspectRatio: 4/3
      },
      defaultOptions: {
        width: 800,
        quality: 90,
        format: 'auto'
      }
    };
    
    assets.push(asset);
  }
  
  // Process video files
  for (const file of videoFiles) {
    const relativePath = file.replace(dirPath, '').replace(/\\/g, '/').replace(/^\//, '');
    const extension = path.extname(file).toLowerCase();
    const fileName = path.basename(file, extension);
    
    // Generate a unique ID based on path
    const id = baseId 
      ? `${baseId}-${fileName.replace(/[^a-z0-9]/gi, '-')}`
      : fileName.replace(/[^a-z0-9]/gi, '-');
    
    const publicId = prefix + relativePath.replace(extension, '');
    
    // Create asset entry
    const asset = {
      id,
      type: 'video',
      area: mediaArea || 'undefined',
      description: fileName.replace(/-/g, ' '),
      publicId,
      dimensions: {
        width: 1920,
        height: 1080,
        aspectRatio: 16/9
      },
      defaultOptions: {
        width: 1920,
        quality: 80,
        format: 'auto'
      }
    };
    
    assets.push(asset);
  }
  
  return assets;
}

/**
 * Scan local component assets
 */
async function scanComponentAssets() {
  console.log('Scanning component assets...');
  
  const allComponentAssets = [];
  
  // Get all component directories with assets folders
  const componentDirs = Object.keys(DIRECTORY_STRUCTURE.components);
  
  for (const componentName of componentDirs) {
    const assetDir = `components/${componentName}/assets`;
    
    try {
      const assets = await scanDirectory(assetDir, `component:${componentName}/assets/`, {
        mediaArea: 'component',
        baseId: `${componentName.toLowerCase()}`
      });
      
      allComponentAssets.push(...assets);
      console.log(`Found ${assets.length} assets in ${componentName} component`);
    } catch (error) {
      // Component asset directory doesn't exist, skip
    }
  }
  
  return allComponentAssets;
}

/**
 * Scan page-specific assets
 */
async function scanPageAssets() {
  console.log('Scanning page assets...');
  const pagesDir = 'public/images/pages';
  const allPageAssets = [];
  
  try {
    // Scan all subdirectories in pages
    const pageDirs = await fs.promises.readdir(pagesDir, { withFileTypes: true });
    
    for (const dir of pageDirs) {
      if (dir.isDirectory()) {
        const pagePath = `${pagesDir}/${dir.name}`;
        const assets = await scanDirectory(pagePath, `page:${dir.name}/`, {
          mediaArea: dir.name
        });
        
        allPageAssets.push(...assets);
        console.log(`Found ${assets.length} assets for page: ${dir.name}`);
      }
    }
  } catch (error) {
    console.error('Error scanning page assets:', error);
  }
  
  return allPageAssets;
}

/**
 * Scan global assets
 */
async function scanGlobalAssets() {
  console.log('Scanning global assets...');
  const globalDir = 'public/images/global';
  const allGlobalAssets = [];
  
  try {
    // Scan all subdirectories in global
    const globalDirs = await fs.promises.readdir(globalDir, { withFileTypes: true });
    
    for (const dir of globalDirs) {
      if (dir.isDirectory()) {
        const dirPath = `${globalDir}/${dir.name}`;
        const assets = await scanDirectory(dirPath, `page:global/${dir.name}/`, {
          mediaArea: `global-${dir.name}`
        });
        
        allGlobalAssets.push(...assets);
        console.log(`Found ${assets.length} global assets in: ${dir.name}`);
      }
    }
  } catch (error) {
    console.error('Error scanning global assets:', error);
  }
  
  return allGlobalAssets;
}

/**
 * Generate example Cloudinary asset entries
 */
function generateCloudinaryExamples() {
  console.log('Generating Cloudinary asset examples...');
  
  const exampleAssets = [];
  
  // Generate one example asset per main folder
  const mainFolders = Object.keys(DIRECTORY_STRUCTURE.cloudinary);
  
  for (const folder of mainFolders) {
    const assetId = `${folder}-example`;
    const publicId = `${folder}/example-${folder}`;
    
    const dimensions = folder === 'videos' 
      ? { width: 1920, height: 1080, aspectRatio: 16/9 }
      : folder === 'team' 
        ? { width: 600, height: 800, aspectRatio: 3/4 }
        : { width: 1200, height: 800, aspectRatio: 3/2 };
    
    const asset = {
      id: assetId,
      type: folder === 'videos' ? 'video' : 'image',
      area: folder,
      description: `Example ${folder} asset`,
      publicId,
      dimensions,
      defaultOptions: {
        width: dimensions.width,
        quality: folder === 'videos' ? 80 : 90,
        format: 'auto'
      }
    };
    
    exampleAssets.push(asset);
  }
  
  return exampleAssets;
}

/**
 * Format asset data for output
 */
function formatAssetsForOutput(assets) {
  // Create mapping by id
  const assetMap = assets.reduce((map, asset) => {
    map[asset.id] = asset;
    return map;
  }, {});
  
  // Convert to pretty JSON
  return JSON.stringify(assetMap, null, 2);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Scan all asset types
    const componentAssets = await scanComponentAssets();
    const pageAssets = await scanPageAssets();
    const globalAssets = await scanGlobalAssets();
    const cloudinaryExamples = generateCloudinaryExamples();
    
    // Combine all assets
    const allAssets = [
      ...componentAssets,
      ...pageAssets,
      ...globalAssets,
      ...cloudinaryExamples
    ];
    
    console.log(`\nTotal assets found: ${allAssets.length}`);
    console.log(`- Component assets: ${componentAssets.length}`);
    console.log(`- Page assets: ${pageAssets.length}`);
    console.log(`- Global assets: ${globalAssets.length}`);
    console.log(`- Cloudinary examples: ${cloudinaryExamples.length}`);
    
    // Format for output
    const outputContent = `// Auto-generated media assets registry
// Generated on: ${new Date().toISOString()}
// Total assets: ${allAssets.length}

import { MediaAsset } from './media/types';

export const IMAGE_ASSETS = ${formatAssetsForOutput(allAssets)};

export default IMAGE_ASSETS;
`;
    
    // Write to file
    await fs.promises.writeFile('lib/image-config.js', outputContent);
    console.log('\nAsset registry written to lib/image-config.js');
    
    // Also generate a report file
    const report = {
      generatedAt: new Date().toISOString(),
      totalAssets: allAssets.length,
      assetsByType: {
        image: allAssets.filter(a => a.type === 'image').length,
        video: allAssets.filter(a => a.type === 'video').length
      },
      assetsByArea: allAssets.reduce((acc, asset) => {
        acc[asset.area] = (acc[asset.area] || 0) + 1;
        return acc;
      }, {})
    };
    
    await fs.promises.writeFile('media-assets-report.json', JSON.stringify(report, null, 2));
    console.log('Asset report written to media-assets-report.json');
    
  } catch (error) {
    console.error('Error scanning assets:', error);
    process.exit(1);
  }
}

// Execute main function
main(); 