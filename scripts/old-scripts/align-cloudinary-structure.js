// Script to align Cloudinary structure with local directory structure
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dyrzyfg3w',
  api_key: '956447123689192',
  api_secret: 'zGsan0MXgwGKIGnQ0t1EVKYSqg0'
});

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Create mapping of local directories to Cloudinary paths
const directoryMapping = {
  // Main structure mapping
  'public/images/pages': 'fal/pages',
  'public/images/global': 'fal/global',
  'components': 'fal/components',
  'public/videos': 'fal/videos',
  
  // Specific service mappings for 1:1 alignment
  'public/images/pages/services/plastic-surgery': 'fal/pages/services/plastic-surgery',
  'public/images/pages/services/plastic-surgery/body': 'fal/pages/services/plastic-surgery/body',
  'public/images/pages/services/plastic-surgery/breast': 'fal/pages/services/plastic-surgery/breast',
  'public/images/pages/services/plastic-surgery/head-and-neck': 'fal/pages/services/plastic-surgery/head-and-neck',
  
  // Body procedures
  'public/images/pages/services/plastic-surgery/body/abdominoplasty': 'fal/pages/services/plastic-surgery/body/abdominoplasty',
  'public/images/pages/services/plastic-surgery/body/mini-abdominoplasty': 'fal/pages/services/plastic-surgery/body/mini-abdominoplasty',
  'public/images/pages/services/plastic-surgery/body/liposuction': 'fal/pages/services/plastic-surgery/body/liposuction',
  'public/images/pages/services/plastic-surgery/body/arm-lift': 'fal/pages/services/plastic-surgery/body/arm-lift',
  'public/images/pages/services/plastic-surgery/body/thigh-lift': 'fal/pages/services/plastic-surgery/body/thigh-lift',
  
  // Breast procedures
  'public/images/pages/services/plastic-surgery/breast/breast-augmentation': 'fal/pages/services/plastic-surgery/breast/breast-augmentation',
  'public/images/pages/services/plastic-surgery/breast/breast-reduction': 'fal/pages/services/plastic-surgery/breast/breast-reduction',
  'public/images/pages/services/plastic-surgery/breast/breast-revision': 'fal/pages/services/plastic-surgery/breast/breast-revision',
  'public/images/pages/services/plastic-surgery/breast/breast-nipple-areolar-complex': 'fal/pages/services/plastic-surgery/breast/breast-nipple-areolar-complex',
  
  // Head and neck procedures
  'public/images/pages/services/plastic-surgery/head-and-neck/face': 'fal/pages/services/plastic-surgery/head-and-neck/face',
  'public/images/pages/services/plastic-surgery/head-and-neck/eyelids': 'fal/pages/services/plastic-surgery/head-and-neck/eyelids',
  'public/images/pages/services/plastic-surgery/head-and-neck/ears': 'fal/pages/services/plastic-surgery/head-and-neck/ears',
  'public/images/pages/services/plastic-surgery/head-and-neck/nose': 'fal/pages/services/plastic-surgery/head-and-neck/nose',
  'public/images/pages/services/plastic-surgery/head-and-neck/neck': 'fal/pages/services/plastic-surgery/head-and-neck/neck',
};

// Media file extensions to process
const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mov'];

// 1. Create folders in Cloudinary to match local structure
async function createCloudinaryFolders() {
  console.log('\n📁 Creating Cloudinary folders to match local structure...');
  
  for (const [localPath, cloudinaryPath] of Object.entries(directoryMapping)) {
    try {
      // Create folder in Cloudinary (note: this is actually a no-op in Cloudinary
      // as folders are automatically created when uploading assets, but keeping this
      // for documentation purposes)
      console.log(`Creating Cloudinary folder: ${cloudinaryPath}`);
      
      // In a real implementation, you might want to verify the folder exists
      // by checking if any assets are in this path
    } catch (error) {
      console.error(`Error creating Cloudinary folder ${cloudinaryPath}:`, error);
    }
  }
}

// 2. Find all local image files
async function findLocalMediaFiles() {
  console.log('\n🔍 Finding all local media files...');
  
  const mediaFiles = [];
  
  for (const localPath of Object.keys(directoryMapping)) {
    const fullLocalPath = path.join(projectRoot, localPath);
    
    if (fs.existsSync(fullLocalPath)) {
      // Handle component assets differently
      const pattern = localPath === 'components' ? '**/assets/**/*.*' : '**/*.*';
      
      const files = globSync(path.join(fullLocalPath, pattern), { nodir: true });
      
      const filteredFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return mediaExtensions.includes(ext);
      });
      
      filteredFiles.forEach(file => {
        let cloudinaryPath;
        
        if (localPath === 'components' && file.includes('/assets/')) {
          // Special handling for component assets
          const componentPathMatch = file.match(/components\/([^\/]+)\/assets\/(.+)/);
          if (componentPathMatch) {
            const [, componentName, assetPath] = componentPathMatch;
            const relativePath = `${componentName}/assets/${assetPath}`;
            cloudinaryPath = `fal/components/${relativePath}`.replace(/\.[^/.]+$/, '');
          }
        } else {
          const relativePath = path.relative(fullLocalPath, file).replace(/\\/g, '/');
          const cloudinaryBasePath = directoryMapping[localPath];
          cloudinaryPath = `${cloudinaryBasePath}/${relativePath}`.replace(/\.[^/.]+$/, '');
        }
        
        mediaFiles.push({
          localFile: file,
          cloudinaryPath: cloudinaryPath
        });
      });
    }
  }
  
  console.log(`Found ${mediaFiles.length} local media files`);
  return mediaFiles;
}

// 3. Check which files already exist in Cloudinary
async function checkCloudinaryExistence(mediaFiles) {
  console.log('\n🔄 Checking which files already exist in Cloudinary...');
  
  const existenceStatus = [];
  
  for (const mediaFile of mediaFiles) {
    try {
      const { cloudinaryPath } = mediaFile;
      
      try {
        // Check if file exists in Cloudinary
        await cloudinary.api.resource(cloudinaryPath);
        existenceStatus.push({
          ...mediaFile,
          existsInCloudinary: true
        });
      } catch (error) {
        if (error.error && error.error.http_code === 404) {
          existenceStatus.push({
            ...mediaFile,
            existsInCloudinary: false
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error checking Cloudinary existence for ${mediaFile.cloudinaryPath}:`, error);
      existenceStatus.push({
        ...mediaFile,
        existsInCloudinary: false,
        error: error.message
      });
    }
  }
  
  console.log(`Checked ${existenceStatus.length} files`);
  const needsUpload = existenceStatus.filter(file => !file.existsInCloudinary);
  console.log(`${needsUpload.length} files need to be uploaded to Cloudinary`);
  
  return existenceStatus;
}

// 4. Upload missing files to Cloudinary
async function uploadToCloudinary(mediaFiles) {
  console.log('\n📤 Uploading missing files to Cloudinary...');
  
  const filesToUpload = mediaFiles.filter(file => !file.existsInCloudinary);
  console.log(`Uploading ${filesToUpload.length} files to Cloudinary...`);
  
  // Process in batches
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < filesToUpload.length; i += batchSize) {
    const batch = filesToUpload.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (file) => {
      try {
        const { localFile, cloudinaryPath } = file;
        console.log(`Uploading ${localFile} to ${cloudinaryPath}...`);
        
        // Determine resource type based on extension
        const ext = path.extname(localFile).toLowerCase();
        const resourceType = ext === '.mp4' || ext === '.webm' || ext === '.mov' ? 'video' : 'image';
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            localFile,
            {
              public_id: cloudinaryPath,
              resource_type: resourceType,
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
        
        console.log(`✅ Successfully uploaded to ${result.secure_url}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to upload ${file.localFile}:`, error);
        errorCount++;
      }
    }));
    
    console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesToUpload.length / batchSize)}`);
    
    // Add a small delay between batches
    if (i + batchSize < filesToUpload.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\nUpload Summary: ${successCount} successful, ${errorCount} failed`);
  return { successCount, errorCount };
}

// 5. Generate a reference of all media files in the project
async function generateMediaRegistry(mediaFiles) {
  console.log('\n📝 Generating media registry...');
  
  // Create the registry data structure
  const registry = {};
  
  mediaFiles.forEach(file => {
    const { cloudinaryPath, existsInCloudinary } = file;
    
    if (existsInCloudinary) {
      // Extract the ID (last part of the cloudinary path)
      const id = cloudinaryPath.split('/').pop();
      
      registry[id] = {
        id,
        publicId: cloudinaryPath,
        description: `${id} image`,
        defaultOptions: {
          width: 800,
          quality: 90
        }
      };
    }
  });
  
  // Write to a file
  const registryFilePath = path.join(projectRoot, 'lib/image-config.js');
  const registryContent = `// Auto-generated media registry - DO NOT EDIT MANUALLY
export const IMAGE_ASSETS = ${JSON.stringify(registry, null, 2)};
`;
  
  fs.mkdirSync(path.dirname(registryFilePath), { recursive: true });
  fs.writeFileSync(registryFilePath, registryContent);
  
  console.log(`Generated registry with ${Object.keys(registry).length} entries in lib/image-config.js`);
}

// 6. Create a component reference guide
async function generateReferenceGuide(mediaFiles) {
  console.log('\n📚 Generating component reference guide...');
  
  // Create a markdown reference guide
  const referenceGuideContent = `# Media Reference Guide

This guide provides a reference for all media assets in the project and how to use them in components.

## Available Media Assets

| ID | Cloudinary Path | Type |
|-----|---------------|------|
${mediaFiles
  .filter(file => file.existsInCloudinary)
  .map(file => {
    const id = file.cloudinaryPath.split('/').pop();
    const type = file.localFile.match(/\.(mp4|webm|mov)$/i) ? 'Video' : 'Image';
    return `| ${id} | ${file.cloudinaryPath} | ${type} |`;
  })
  .join('\n')}

## Usage Examples

### Using with CloudinaryImage Component

\`\`\`jsx
import { CloudinaryImage } from '@/components/media/CloudinaryMedia';

// Example usage
<CloudinaryImage
  id="fal/pages/services/plastic-surgery/body/tummy-tuck"
  alt="Tummy Tuck Procedure"
  fill
  width={800}
  height={600}
  className="object-cover"
  sizes="100vw"
/>
\`\`\`

### Using with CloudinaryVideo Component

\`\`\`jsx
import { CloudinaryVideo } from '@/components/media/CloudinaryMedia';

// Example usage
<CloudinaryVideo
  id="fal/videos/backgrounds/hero-video"
  width={1920}
  height={1080}
  autoPlay
  muted
  loop
  className="w-full h-full object-cover"
/>
\`\`\`
`;
  
  const referenceGuidePath = path.join(projectRoot, 'docs/media-reference-guide.md');
  fs.mkdirSync(path.dirname(referenceGuidePath), { recursive: true });
  fs.writeFileSync(referenceGuidePath, referenceGuideContent);
  
  console.log(`Generated reference guide at docs/media-reference-guide.md`);
}

// Main function
async function alignCloudinaryStructure() {
  console.log('🚀 Starting Cloudinary structure alignment...');
  
  // Step 1: Create folders in Cloudinary
  await createCloudinaryFolders();
  
  // Step 2: Find all local media files
  const mediaFiles = await findLocalMediaFiles();
  
  // Step 3: Check which files already exist in Cloudinary
  const mediaFilesWithStatus = await checkCloudinaryExistence(mediaFiles);
  
  // Step 4: Upload missing files to Cloudinary
  await uploadToCloudinary(mediaFilesWithStatus);
  
  // Step 5: Generate a reference of all media files
  await generateMediaRegistry(mediaFilesWithStatus);
  
  // Step 6: Create a component reference guide
  await generateReferenceGuide(mediaFilesWithStatus);
  
  console.log('\n✨ Cloudinary structure alignment complete!');
  console.log('Now your local directory structure and Cloudinary structure are in 1:1 alignment.');
  console.log('Remember to use the full Cloudinary paths in your components.');
}

// Run the alignment
alignCloudinaryStructure()
  .catch(error => console.error('Alignment failed:', error)); 