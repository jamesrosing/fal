const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dyrzyfg3w',
  api_key: '956447123689192',
  api_secret: 'zGsan0MXgwGKIGnQ0t1EVKYSqg0'
});

// Files to upload
const images = [
  {
    path: './public/images/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero.jpg',
    publicId: 'services-plastic-surgery/hero/plastic-surgery-face-neck-procedures'
  },
  {
    path: './public/images/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero.jpg',
    publicId: 'services-plastic-surgery/hero/plastic-surgery-breast-procedures'
  },
  {
    path: './public/images/pages/services/plastic-surgery/body/plastic-surgery-body-hero.jpg',
    publicId: 'services-plastic-surgery/hero/plastic-surgery-body-procedures'
  }
];

// Upload each image
async function uploadImages() {
  console.log('Starting uploads to Cloudinary...');
  
  for (const image of images) {
    try {
      console.log(`Uploading ${image.path} to ${image.publicId}...`);
      
      const result = await cloudinary.uploader.upload(image.path, {
        public_id: image.publicId,
        overwrite: true
      });
      
      console.log(`Successfully uploaded ${image.path}`);
      console.log(`URL: ${result.secure_url}`);
      console.log('---');
    } catch (error) {
      console.error(`Error uploading ${image.path}:`, error);
    }
  }
  
  console.log('Upload process completed.');
}

// Run the upload
uploadImages(); 