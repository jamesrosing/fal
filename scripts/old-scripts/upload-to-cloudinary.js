const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dyrzyfg3w',
  api_key: '956447123689192',
  api_secret: 'zGsan0MXgwGKIGnQ0t1EVKYSqg0'
});

// Files to upload
const uploads = [
  {
    path: './public/images/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero'
  },
  {
    path: './public/images/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero'
  },
  {
    path: './public/images/pages/services/plastic-surgery/body/plastic-surgery-body-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero'
  },
  {
    path: './public/images/pages/services/plastic-surgery/plastic-surgery-hero.jpg',
    publicId: 'fal/pages/services/plastic-surgery/plastic-surgery-hero'
  }
];

// Process uploads
async function processUploads() {
  for (const upload of uploads) {
    try {
      console.log(`Uploading ${upload.path} to ${upload.publicId}...`);
      const result = await cloudinary.uploader.upload(upload.path, {
        public_id: upload.publicId,
        overwrite: true
      });
      console.log(`Success: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${upload.path}:`, error);
    }
  }
}

processUploads()
  .then(() => console.log('All uploads complete'))
  .catch(error => console.error('Upload process failed:', error)); 