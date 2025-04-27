import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Map of components with specific migration logic
const componentProcessors = {
  // Handle contact page img tags
  'app/contact/page.tsx': (content) => {
    // Replace hardcoded img tags with OptimizedImage
    let newContent = content.replace(
      /<img[\s\S]*?src="\${review\.profile_photo_url[^>]*>/g,
      '<OptimizedImage id="profiles/placeholder" alt="Reviewer profile" height={24} width={24} className="w-6 h-6 rounded-full mr-2" />'
    );
    
    newContent = newContent.replace(
      /<img[\s\S]*?src="\${photoUrl}"[^>]*>/g,
      '<OptimizedImage id="places/placeholder" alt="Business photo" height={80} width={80} className="w-20 h-20 object-cover rounded" />'
    );
    
    return newContent;
  },
  
  // Handle articles list
  'app/articles/articles-list.tsx': (content) => {
    return content.replace(
      /imageUrl\s+\?\s+imageUrl\s+:\s+`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/f_auto,q_auto\/\${imageUrl}`/g,
      'imageUrl ? imageUrl : mediaUrl(`articles/${imageUrl}`)'
    );
  },
  
  // Handle article slug page
  'app/articles/[slug]/page.tsx': (content) => {
    let newContent = content.replace(
      /article\.image\s+\?\s+article\.image\s+:\s+`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/f_auto,q_auto\/\${article\.image}`/g,
      'article.image ? article.image : mediaUrl(`articles/${article.image}`)'
    );
    
    newContent = newContent.replace(
      /relatedArticle\.image\s+\?\s+relatedArticle\.image\s+:\s+`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/f_auto,q_auto\/\${relatedArticle\.image}`/g,
      'relatedArticle.image ? relatedArticle.image : mediaUrl(`articles/${relatedArticle.image}`)'
    );
    
    return newContent;
  },

  // Handle admin media page
  'app/admin/media/page.tsx': (content) => {
    return content.replace(
      /src={\`https:\/\/res\.cloudinary\.com\/\${process\.env\.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\/image\/upload\/\${asset\.cloudinary_id}\`}/g,
      'src={mediaUrl(asset.cloudinary_id)}'
    );
  },
  
  // Handle VisualMediaManager
  'components/VisualMediaManager.tsx': (content) => {
    return content.replace(
      /<video\s+src={getCloudinaryUrl\(position\.currentImage[^>]*>[\s\S]*?<\/video>/g,
      '<OptimizedVideo id={position.currentImage} options={{ controls: true, muted: true }} />'
    );
  },
  
  // Handle CloudinaryVideo
  'components/CloudinaryVideo.tsx': (content) => {
    return content.replace(
      /src={[`'"]https:\/\/res\.cloudinary\.com\//g,
      'src={mediaUrl('
    );
  },
  
  // Handle article-layout
  'components/article-layout.tsx': (content) => {
    return content.replace(
      /\`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/v\d+\/([^`]+)\`/g,
      'mediaUrl("$1")'
    );
  },
  
  // Handle media-image
  'components/ui/media-image.tsx': (content) => {
    return content.replace(
      /\`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/v\d+\/([^`]+)\`/g,
      'mediaUrl("$1")'
    );
  },
  
  // Handle background-video
  'components/ui/background-video.tsx': (content) => {
    let newContent = content.replace(
      /<video[\s\S]*?<\/video>/g,
      '<OptimizedVideo id={videoId} options={{ autoPlay: true, muted: true, loop: true }} className={className} />'
    );
    
    return newContent;
  },
  
  // Handle UnifiedVideo
  'components/media/UnifiedVideo.tsx': (content) => {
    return content.replace(
      /<video[\s\S]*?<\/video>/g,
      '<OptimizedVideo id={src} options={{ autoPlay, muted, loop, controls, playsInline }} />'
    );
  },
  
  // Handle OptimizedVideo
  'components/media/OptimizedVideo.tsx': (content) => {
    return content.replace(
      /src={\s*[`'"]?https:\/\/res\.cloudinary\.com\/[^}]+}/g,
      'src={mediaUrl(id || "videos/placeholder")}'
    );
  },
  
  // Handle CloudinaryMedia
  'components/media/CloudinaryMedia.tsx': (content) => {
    return content.replace(
      /\`https:\/\/res\.cloudinary\.com\/[^\/]+\/[^\/]+\/upload\/[^`]+\`/g,
      'mediaUrl(id)'
    );
  },
  
  // Handle articles-section
  'components/sections/articles-section.tsx': (content) => {
    return content.replace(
      /\`https:\/\/res\.cloudinary\.com\/dyrzyfg3w\/image\/upload\/v\d+\/([^`]+)\`/g,
      'mediaUrl("$1")'
    );
  }
};

function addImports(content) {
  // Check for needed imports
  const needsOptimizedImage = content.includes('<OptimizedImage') && !content.includes('import OptimizedImage');
  const needsOptimizedVideo = content.includes('<OptimizedVideo') && !content.includes('import OptimizedVideo');
  const needsMediaHelpers = (content.includes('mediaUrl(') || content.includes('mediaId(')) && 
                         !content.includes('import { mediaId');
  
  if (!needsOptimizedImage && !needsOptimizedVideo && !needsMediaHelpers) {
    return content;
  }
  
  // Find the last import
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  const lastImportIndex = importLines.length ? 
    content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length : 
    0;
  
  let newImports = '';
  
  if (needsOptimizedImage) {
    newImports += `\nimport OptimizedImage from '@/components/media/OptimizedImage';`;
  }
  
  if (needsOptimizedVideo) {
    newImports += `\nimport OptimizedVideo from '@/components/media/OptimizedVideo';`;
  }
  
  if (needsMediaHelpers) {
    newImports += `\nimport { mediaId, mediaUrl } from "@/lib/media";`;
  }
  
  newImports += '\n';
  
  return content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
}

async function processFile(filePath) {
  try {
    // Convert absolute path to relative for lookup
    const relativePath = path.relative('.', filePath).replace(/\\/g, '/');
    
    // Check if we have a processor for this file
    if (!Object.keys(componentProcessors).some(key => relativePath.endsWith(key))) {
      return false;
    }
    
    console.log(`Processing ${relativePath}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the matching processor
    const processorKey = Object.keys(componentProcessors).find(key => relativePath.endsWith(key));
    
    if (!processorKey) {
      return false;
    }
    
    // Apply the custom processor
    let newContent = componentProcessors[processorKey](content);
    
    // Add necessary imports
    newContent = addImports(newContent);
    
    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${relativePath}`);
      return true;
    } else {
      console.log(`⏭️ No changes needed in ${relativePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Find all files that might need processing
    const targetPaths = Object.keys(componentProcessors);
    
    console.log(`Found ${targetPaths.length} files to process`);
    
    let updated = 0;
    
    // Process each file
    for (const relativePath of targetPaths) {
      const resolvedPath = path.resolve(relativePath);
      
      if (fs.existsSync(resolvedPath)) {
        const result = await processFile(resolvedPath);
        if (result) updated++;
      } else {
        console.log(`⚠️ File not found: ${relativePath}`);
      }
    }
    
    console.log(`\nMigration Summary:`);
    console.log(`Total target files: ${targetPaths.length}`);
    console.log(`Updated files: ${updated}`);
    
    if (updated > 0) {
      console.log(`\nNext steps:`);
      console.log(`1. Run verification script to check all assets`);
      console.log(`2. Test the application to ensure all components work correctly`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 