/**
 * Migrate Image from Vercel Blob to Cloudinary
 * 
 * This script helps you download a Vercel Blob image and upload it to Cloudinary.
 * Useful for migrating images one at a time.
 * 
 * Usage: 
 * node scripts/migrate-image-to-cloudinary.js https://your-storage.public.blob.vercel-storage.com/image-name-id.webp
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { pipeline } from 'stream';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify pipeline
const pipelineAsync = promisify(pipeline);

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to download an image from a URL to a temporary file
async function downloadImage(url, outputPath) {
  try {
    console.log(`Downloading image from ${url}`);
    
    // Create temporary directory if it doesn't exist
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create write stream
    const writer = fs.createWriteStream(outputPath);
    
    // Download the file
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    // Pipe the response to the file
    await pipelineAsync(response.data, writer);
    
    console.log(`Image downloaded to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    throw error;
  }
}

// Function to extract the suggested public ID and file name
function extractFileInfo(url) {
  // Get the part after the last slash
  const fullName = url.split('/').pop();
  
  // Handle URLs with hash or query parameters
  const baseName = fullName.split(/[?#]/)[0];
  
  // Extract just the filename without the unique ID suffix
  // Format is usually: filename-UniqueIDSuffix.ext
  const match = baseName.match(/(.+)-[A-Za-z0-9]{22,}\.(webp|jpg|jpeg|png|gif|svg)/);
  
  if (match) {
    const cleanName = match[1];
    const extension = match[2];
    const publicId = cleanName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return {
      fileName: `${cleanName}.${extension}`,
      publicId,
      extension
    };
  }
  
  // For files that don't match the pattern
  const parts = baseName.split('.');
  const extension = parts.pop();
  const name = parts.join('.');
  const publicId = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return {
    fileName: baseName,
    publicId,
    extension
  };
}

// Function to upload an image to Cloudinary
async function uploadToCloudinary(filePath, publicId, folder = '') {
  try {
    console.log(`Uploading to Cloudinary with publicId: ${publicId}`);
    
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto'
      };
      
      if (folder) {
        uploadOptions.folder = folder;
      }
      
      cloudinary.uploader.upload(filePath, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  } catch (error) {
    console.error(`Error uploading to Cloudinary: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  // Get URL from command line
  const url = process.argv[2];
  
  if (!url) {
    console.error('Please provide a Vercel Blob URL as an argument');
    console.log('Usage: node scripts/migrate-image-to-cloudinary.js https://your-storage.public.blob.vercel-storage.com/image-name-id.webp');
    process.exit(1);
  }
  
  // Check if URL is a Vercel Blob URL
  if (!url.includes('blob.vercel-storage.com')) {
    console.error('The URL does not appear to be a Vercel Blob URL');
    process.exit(1);
  }
  
  // Optional folder parameter
  const folder = process.argv[3] || '';
  
  try {
    // Extract file information
    const { fileName, publicId, extension } = extractFileInfo(url);
    
    console.log(`File name: ${fileName}`);
    console.log(`Suggested public ID: ${publicId}`);
    
    // Create path for temporary file
    const tempFilePath = path.join('./tmp', fileName);
    
    // Download image
    await downloadImage(url, tempFilePath);
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(tempFilePath, publicId, folder);
    
    console.log('\n===== SUCCESS =====');
    console.log(`Image successfully uploaded to Cloudinary!`);
    console.log(`Public ID: ${result.public_id}`);
    console.log(`URL: ${result.secure_url}`);
    console.log(`\nRecommended code for Next.js Image:`);
    console.log(`<CloudinaryImage
  publicId="${result.public_id}"
  alt=""
  width={800}
  height={600}
  options={{
    crop: 'fill',
    gravity: 'center'
  }}
/>`);
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log(`\nTemporary file deleted: ${tempFilePath}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 