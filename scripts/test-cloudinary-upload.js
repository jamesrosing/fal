// Script to test Cloudinary upload
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryUpload(filePath) {
  try {
    // Validate Cloudinary configuration
    console.log('Cloudinary configuration:');
    console.log('- Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✓' : '✗');
    console.log('- API key:', process.env.CLOUDINARY_API_KEY ? '✓' : '✗');
    console.log('- API secret:', process.env.CLOUDINARY_API_SECRET ? '✓' : '✗');
    console.log('- Upload preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✓' : '✗');
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Error: Missing Cloudinary configuration');
      process.exit(1);
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }
    
    const filename = path.basename(filePath);
    console.log(`Uploading ${filename}...`);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        {
          folder: 'test-uploads',
          public_id: `test-${Date.now()}`,
          overwrite: true,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );
    });
    
    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    process.exit(1);
  }
}

// Get the file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path to upload');
  console.log('Usage: node test-cloudinary-upload.js <file-path>');
  process.exit(1);
}

testCloudinaryUpload(filePath); 