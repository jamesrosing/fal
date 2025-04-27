// Comprehensive script to upload all media files to Cloudinary
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

// Define media directories to scan
const directories = [
  {
    localPath: 'public/images/pages',
    cloudinaryPrefix: 'fal/pages',
    description: 'Page-specific images'
  },
  {
    localPath: 'public/images/global',
    cloudinaryPrefix: 'fal/global',
    description: 'Global images'
  },
  {
    localPath: 'components',
    cloudinaryPrefix: 'fal/components',
    description: 'Component assets',
    subdirectoryPattern: '**/assets/**/*.*'
  },
  {
    localPath: 'public/videos',
    cloudinaryPrefix: 'fal/videos',
    description: 'Video assets',
    resourceType: 'video'
  },
  // Add specific paths for plastic surgery pages
  {
    localPath: 'public/images/pages/services/plastic-surgery',
    cloudinaryPrefix: 'fal/pages/services/plastic-surgery',
    description: 'Plastic Surgery main page images'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/body',
    cloudinaryPrefix: 'fal/pages/services/plastic-surgery/body',
    description: 'Plastic Surgery Body page images'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/breast',
    cloudinaryPrefix: 'fal/pages/services/plastic-surgery/breast',
    description: 'Plastic Surgery Breast page images'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/head-and-neck',
    cloudinaryPrefix: 'fal/pages/services/plastic-surgery/head-and-neck',
    description: 'Plastic Surgery Head and Neck page images'
  }
];

// Specific image paths that need migration for plastic surgery pages
const specificImages = [
  // Main plastic surgery page hero
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg',
    cloudinaryPath: 'fal/pages/services/plastic-surgery/plastic-surgery-hero',
    description: 'Plastic Surgery hero image'
  },
  // Body procedures images
  {
    localPath: 'public/images/pages/services/plastic-surgery/body/plastic-surgery-body-hero.jpg',
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero',
    description: 'Body procedures hero image'
  },
  // Add dummy entries for body procedure images (we'll create these if they don't exist)
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/tummy-tuck',
    description: 'Tummy tuck procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/liposuction',
    description: 'Liposuction procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/body-lift',
    description: 'Body lift procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/bbl',
    description: 'Brazilian butt lift procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/body/arm-lift',
    description: 'Arm lift procedure image'
  },
  
  // Breast procedures images
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero',
    description: 'Breast procedures hero image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/breast-augmentation',
    description: 'Breast augmentation procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/breast-lift',
    description: 'Breast lift procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/breast-reduction',
    description: 'Breast reduction procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/breast-revision',
    description: 'Breast revision procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/breast/nipple-areola',
    description: 'Nipple areola procedure image'
  },
  
  // Head and neck procedures images
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero',
    description: 'Head and neck procedures hero image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/eyelids',
    description: 'Eyelids procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/ears',
    description: 'Ears procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/face',
    description: 'Face procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/neck',
    description: 'Neck procedure image'
  },
  {
    localPath: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg', // Use main hero as source
    cloudinaryPath: 'fal/pages/services/plastic-surgery/head-and-neck/nose',
    description: 'Nose procedure image'
  }
];

// Image and video extensions to process
const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mov'];

// Function to upload a single file
async function uploadFile(file, cloudinaryPath, options = {}) {
  try {
    console.log(`Uploading ${file} to ${cloudinaryPath}...`);
    
    // Check if file already exists on Cloudinary
    try {
      await cloudinary.api.resource(cloudinaryPath, { resource_type: options.resource_type || 'image' });
      console.log(`⚠️ File already exists at ${cloudinaryPath}, skipping...`);
      return null;
    } catch (error) {
      // File doesn't exist, proceed with upload
      if (error.error && error.error.http_code === 404) {
        // Upload the file
        const result = await cloudinary.uploader.upload(file, {
          public_id: cloudinaryPath,
          overwrite: false,
          resource_type: options.resource_type || 'auto',
          ...options
        });
        
        console.log(`✅ Successfully uploaded to ${result.secure_url}`);
        return result;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to upload ${file}:`, error.message);
    return null;
  }
}

// Function to scan a directory and upload files
async function processDirectory(dirConfig) {
  const { localPath, cloudinaryPrefix, description, subdirectoryPattern, resourceType } = dirConfig;
  const fullLocalPath = path.join(projectRoot, localPath);
  
  console.log(`\n📁 Processing ${description} from ${localPath}...`);
  
  try {
    const pattern = subdirectoryPattern || '**/*.*';
    const files = globSync(path.join(fullLocalPath, pattern), { nodir: true });
    
    const mediaFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return mediaExtensions.includes(ext);
    });
    
    console.log(`Found ${mediaFiles.length} media files to process.`);
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < mediaFiles.length; i += batchSize) {
      const batch = mediaFiles.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (file) => {
        let relativePath = path.relative(fullLocalPath, file);
        
        // Special handling for component assets
        if (subdirectoryPattern && file.includes('/assets/')) {
          const componentPathMatch = file.match(/components\/([^\/]+)\/assets\/(.+)/);
          if (componentPathMatch) {
            const [, componentName, assetPath] = componentPathMatch;
            relativePath = `${componentName}/assets/${assetPath}`;
          }
        }
        
        // Convert path separators to forward slashes
        relativePath = relativePath.replace(/\\/g, '/');
        
        // Remove file extension for Cloudinary ID
        const extensionless = relativePath.replace(/\.[^/.]+$/, '');
        const cloudinaryPath = `${cloudinaryPrefix}/${extensionless}`;
        
        await uploadFile(file, cloudinaryPath, { resource_type: resourceType });
      }));
      
      console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mediaFiles.length / batchSize)}`);
      
      // Add a small delay between batches
      if (i + batchSize < mediaFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return mediaFiles.length;
  } catch (error) {
    console.error(`Error processing directory ${localPath}:`, error);
    return 0;
  }
}

// Process specific image files
async function processSpecificImages() {
  console.log('\n📸 Processing specific image files...');
  
  let processed = 0;
  
  for (const imageConfig of specificImages) {
    const { localPath, cloudinaryPath, description } = imageConfig;
    const fullLocalPath = path.join(projectRoot, localPath);
    
    // Check if local file exists
    if (fs.existsSync(fullLocalPath)) {
      console.log(`Processing ${description}...`);
      await uploadFile(fullLocalPath, cloudinaryPath);
      processed++;
    } else {
      console.warn(`⚠️ Local file not found: ${localPath}`);
    }
  }
  
  return processed;
}

// Main function to process all directories
async function migrateAllMedia() {
  console.log('🚀 Starting comprehensive media migration to Cloudinary...');
  
  let totalProcessed = 0;
  
  // Process regular directories
  for (const directory of directories) {
    const count = await processDirectory(directory);
    totalProcessed += count;
  }
  
  // Process specific image files
  const specificCount = await processSpecificImages();
  totalProcessed += specificCount;
  
  console.log(`\n✨ Migration complete! Processed ${totalProcessed} files.`);
  console.log('Remember to update your components to use the new CloudinaryImage component with the uploaded paths.');
}

// Run the migration
migrateAllMedia()
  .catch(error => console.error('Migration failed:', error)); 