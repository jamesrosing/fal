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

// Placeholder images to create
// We'll create simple text-based images for these placeholders
const placeholders = [
  { id: 'about-allure-md', text: 'About Allure MD' },
  { id: 'allure-md', text: 'ALLURE MD' },
  { id: 'contact-us', text: 'Contact Us' },
  { id: 'articles', text: 'Articles' },
  // Special case for hero/hero-articles
  { id: 'hero/articles', text: 'Articles Hero', specialPath: true },
  // Add other hero placeholders
  { id: 'hero/poster', text: 'Hero Poster', specialPath: true },
  { id: 'hero/fallback', text: 'Hero Fallback', specialPath: true },
  // Add homepage-mission-section video
  { id: 'videos/homepage-mission-section', text: 'Homepage Mission Video', specialPath: true, isVideo: true }
];

// Create a data URL for a simple text-based image
function createDataURL(text) {
  // Create a very simple SVG with the text
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="#cccccc"/>
    <text x="400" y="300" font-family="Arial" font-size="32" text-anchor="middle" fill="#333333">${text}</text>
  </svg>
  `;
  
  // Convert to a data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function uploadPlaceholders() {
  console.log('Uploading placeholder images and videos to Cloudinary...');
  console.log(`Using cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  
  for (const placeholder of placeholders) {
    try {
      if (placeholder.isVideo) {
        // For videos, just log that they should be manually uploaded
        console.log(`⚠️ Video placeholder: ${placeholder.text} as ${placeholder.id}`);
        console.log(`Videos need to be manually uploaded to Cloudinary at the path: home/${placeholder.id}`);
        console.log(`This specific video is already uploaded at: https://res.cloudinary.com/dyrzyfg3w/video/upload/v1741809081/homepage-mission-section.mp4`);
        console.log(`To map correctly, ensure it exists at: home/${placeholder.id}`);
        continue;
      }
      
      // Create a data URL for the placeholder
      const dataUrl = createDataURL(placeholder.text);
      
      // Create the public_id using our naming convention
      const publicId = placeholder.specialPath 
        ? `home/${placeholder.id}` // For special paths like hero/articles
        : `home/placeholders/${placeholder.id.toLowerCase().replace(/\s+/g, '-')}`;
      
      console.log(`Uploading placeholder: ${placeholder.text} as ${publicId}`);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        tags: ['placeholder', 'auto-generated']
      });
      
      console.log(`✓ Uploaded: ${publicId}`);
    } catch (error) {
      console.error(`✗ Error uploading placeholder ${placeholder.id}:`, error);
    }
  }
  
  console.log('Placeholder upload complete!');
}

// Run the function
uploadPlaceholders().catch(console.error); 