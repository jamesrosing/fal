// Simple script to upload procedure images to Cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dyrzyfg3w',
  api_key: '956447123689192',
  api_secret: 'zGsan0MXgwGKIGnQ0t1EVKYSqg0'
});

// Files to upload (path relative to project root)
const files = [
  {
    path: 'public/images/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero'
  },
  {
    path: 'public/images/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero'
  },
  {
    path: 'public/images/pages/services/plastic-surgery/body/plastic-surgery-body-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero'
  },
  {
    path: 'public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/plastic-surgery-hero'
  }
];

// Function to upload a single file
async function uploadFile(file) {
  console.log(`Uploading ${file.path} to ${file.publicId}...`);
  
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: file.publicId,
      overwrite: true
    });
    
    console.log(`✅ Successfully uploaded to ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to upload ${file.path}:`, error.message);
    return null;
  }
}

// Upload all files
async function uploadAllFiles() {
  for (const file of files) {
    await uploadFile(file);
  }
  console.log('All uploads completed!');
}

// Run the upload process
uploadAllFiles()
  .catch(error => console.error('Error in upload process:', error)); 