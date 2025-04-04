import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local found, trying .env');
  dotenv.config();
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define the folders to create
const folders = [
  'home/about',
  'home/articles',
  'home/contact',
  'home/gallery',
  'home/services',
  'home/services/plastic-surgery',
  'home/services/plastic-surgery/body',
  'home/services/plastic-surgery/breast',
  'home/services/plastic-surgery/head-and-neck',
  'home/services/dermatology',
  'home/services/medical-spa',
  'home/services/functional-medicine',
  'home/team',
  'home/team/headshots',
  'home/logos',
  'home/videos',
  'home/videos/backgrounds',
  'home/videos/thumbnails',
  'home/components', // For component-specific assets
  'home/placeholders', // For placeholder images
  'home/hero',
  'home/hero/articles'
];

async function createFolders() {
  console.log('Creating Cloudinary folder structure...');
  console.log(`Using cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  
  for (const folder of folders) {
    try {
      console.log(`Creating folder: ${folder}`);
      await cloudinary.api.create_folder(folder);
      console.log(`✓ Created: ${folder}`);
    } catch (error) {
      // If folder already exists, just log and continue
      if (error.error && error.error.message.includes('already exists')) {
        console.log(`✓ Folder already exists: ${folder}`);
      } else {
        console.error(`✗ Error creating folder ${folder}:`, error);
      }
    }
  }
  
  console.log('Folder creation complete!');
}

// Run the function
createFolders().catch(console.error); 