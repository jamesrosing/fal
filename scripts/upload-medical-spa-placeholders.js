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

// Medical spa placeholders to create
const medicalSpaPlaceholders = [
  // Hero images
  { 
    id: 'services/medical-spa/hero/medical-spa-hero', 
    text: 'Medical Spa Hero', 
    width: 1920,
    height: 1080 
  },
  { 
    id: 'services/medical-spa/hero/medical-spa-facials', 
    text: 'Facial Treatments', 
    width: 1920,
    height: 1080 
  },
  { 
    id: 'services/medical-spa/hero/medical-spa-lasers', 
    text: 'Laser Treatments', 
    width: 1920,
    height: 1080 
  },
  { 
    id: 'services/medical-spa/hero/medical-spa-injectables', 
    text: 'Injectables', 
    width: 1920,
    height: 1080 
  },
  { 
    id: 'services/medical-spa/hero/medical-spa-rf-microneedling', 
    text: 'RF Microneedling', 
    width: 1920,
    height: 1080 
  }
];

// Create a data URL for a simple text-based image with custom dimensions
function createDataURL(text, width = 800, height = 600) {
  // Create a very simple SVG with the text
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#cccccc"/>
    <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="32" text-anchor="middle" fill="#333333">${text}</text>
  </svg>
  `;
  
  // Convert to a data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function uploadMedicalSpaPlaceholders() {
  console.log('Uploading medical spa placeholder images to Cloudinary...');
  console.log(`Using cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  
  for (const placeholder of medicalSpaPlaceholders) {
    try {
      // Create a data URL for the placeholder
      const dataUrl = createDataURL(placeholder.text, placeholder.width, placeholder.height);
      
      // Create the public_id using our naming convention
      const publicId = `home/${placeholder.id}`;
      
      console.log(`Uploading medical spa placeholder: ${placeholder.text} as ${publicId}`);
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        tags: ['placeholder', 'medical-spa', 'auto-generated']
      });
      
      console.log(`✓ Uploaded: ${publicId}`);
    } catch (error) {
      console.error(`✗ Error uploading placeholder ${placeholder.id}:`, error);
    }
  }
  
  console.log('Medical spa placeholder upload complete!');
}

// Run the function
uploadMedicalSpaPlaceholders().catch(console.error); 