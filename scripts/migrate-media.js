import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

function replaceImageTags(content) {
  // Replace Next.js Image tags
  return content.replace(
    /<Image\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    (match, beforeSrc, src, afterSrc) => {
      // Skip if already using OptimizedImage
      if (match.includes('OptimizedImage')) {
        return match;
      }
      
      // Extract alt, width, height, etc.
      const altMatch = match.match(/alt=["']([^"']*)["']/);
      const widthMatch = match.match(/width=[\{"]([^}"]+)[\}"]/);
      const heightMatch = match.match(/height=[\{"]([^}"]+)[\}"]/);
      const priorityMatch = match.includes('priority');
      const fillMatch = match.includes('fill');
      
      const alt = altMatch ? altMatch[1] : '';
      const width = widthMatch ? widthMatch[1] : '800';
      const height = heightMatch ? heightMatch[1] : '600';
      
      // Determine if using Cloudinary
      const isCloudinary = src.includes('res.cloudinary.com');
      
      // Create new component props
      const idProp = isCloudinary ? 
        `id="${extractAssetIdFromCloudinaryUrl(src)}"` : 
        `id="${src}"`;
      
      const altProp = `alt="${alt}"`;
      const widthProp = !fillMatch && widthMatch ? `width={${width}}` : '';
      const heightProp = !fillMatch && heightMatch ? `height={${height}}` : '';
      const priorityProp = priorityMatch ? 'priority' : '';
      const fillProp = fillMatch ? 'fill' : '';
      
      // Put it all together
      return `<OptimizedImage ${idProp} ${altProp} ${widthProp} ${heightProp} ${priorityProp} ${fillProp} />`;
    }
  );
}

function replaceVideoTags(content) {
  return content.replace(
    /<video\s+([^>]*?)>([\s\S]*?)<\/video>/g,
    (match, attrs, children) => {
      // Skip if already using OptimizedVideo
      if (match.includes('OptimizedVideo')) {
        return match;
      }
      
      // Extract source
      const sourceMatch = children.match(/<source\s+([^>]*?)src=["']([^"']+)["']/);
      if (!sourceMatch) return match;
      
      const src = sourceMatch[2];
      
      // Extract other attributes
      const posterMatch = attrs.match(/poster=["']([^"']+)["']/);
      const poster = posterMatch ? posterMatch[1] : '';
      
      const autoPlayMatch = attrs.includes('autoPlay') || attrs.includes('autoplay');
      const mutedMatch = attrs.includes('muted');
      const loopMatch = attrs.includes('loop');
      const controlsMatch = attrs.includes('controls');
      
      // Create new component props
      const idProp = `id="${extractAssetIdFromCloudinaryUrl(src)}"`;
      const posterProp = poster ? `posterImageId="${extractAssetIdFromCloudinaryUrl(poster)}"` : '';
      const optionProps = `options={{
        autoPlay: ${autoPlayMatch},
        muted: ${mutedMatch},
        loop: ${loopMatch},
        controls: ${controlsMatch}
      }}`;
      
      // Put it all together
      return `<OptimizedVideo ${idProp} ${posterProp} ${optionProps} />`;
    }
  );
}

function extractAssetIdFromCloudinaryUrl(url) {
  // Skip if not a cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    // Extract the upload/ part and everything after it
    const parts = url.split('upload/');
    if (parts.length < 2) return url;
    
    // If there are transformations, they'll be after the upload/ part
    const transformAndPublicId = parts[1];
    
    // Check if there are transformations (contains a forward slash)
    const hasTransformations = transformAndPublicId.includes('/');
    
    if (hasTransformations) {
      // Get everything after the transformation part
      const publicId = transformAndPublicId.split('/').slice(1).join('/');
      return publicId;
    } else {
      // No transformations, the whole thing is the public ID
      return transformAndPublicId;
    }
  } catch (error) {
    console.error('Error extracting asset ID:', error);
    return url;
  }
}

function addImports(content) {
  // Check if already has imports
  if (content.includes('OptimizedImage') && content.includes('OptimizedVideo')) {
    return content;
  }
  
  // Find the last import
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  const lastImportIndex = importLines.length ? 
    content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length : 
    0;
  
  const newImports = `
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';
`;
  
  return content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
}

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    // Add imports
    newContent = addImports(newContent);
    
    // Replace image and video tags
    newContent = replaceImageTags(newContent);
    newContent = replaceVideoTags(newContent);
    
    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️ No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  try {
    // Find all React files
    const files = await glob('./app/**/*.{tsx,jsx}');
    const componentFiles = await glob('./components/**/*.{tsx,jsx}');
    const allFiles = [...files, ...componentFiles];
    
    console.log(`Found ${allFiles.length} files to process`);
    
    // Process each file
    for (const file of allFiles) {
      await processFile(file);
    }
    
    console.log('\nMigration Summary:');
    console.log(`Total files processed: ${allFiles.length}`);
    
    // Suggest manual verification
    console.log('\nNext steps:');
    console.log('1. Run the verification script to check all media assets are accessible');
    console.log('2. Manually review updated files, especially in high-priority sections');
    console.log('3. Test the application to ensure all media loads correctly');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main(); 