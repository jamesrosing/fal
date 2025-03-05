/**
 * Migration Template: Vercel Blob to Cloudinary
 * 
 * This file contains example patterns for replacing Vercel Blob URLs with 
 * Cloudinary components and URLs.
 * 
 * Use these patterns as templates when updating your code.
 */

import Image from 'next/image';
import CloudinaryImage from '@/components/CloudinaryImage';
import CloudinaryVideo from '@/components/CloudinaryVideo';
import { getCloudinaryUrl } from '@/lib/cloudinary';

/**
 * PATTERN 1: Basic <img> tag replacement
 * 
 * Before:
 */
const BeforeBasicImg = () => (
  <img 
    src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png" 
    alt="Example" 
    width={800} 
    height={600}
  />
);

/**
 * After (with CloudinaryImage component):
 */
const AfterWithCloudinaryImage = () => (
  <CloudinaryImage
    publicId="example_image"
    alt="Example"
    width={800}
    height={600}
    options={{
      crop: 'fill',
      gravity: 'center'
    }}
  />
);

/**
 * PATTERN 2: Next/Image replacement
 * 
 * Before:
 */
const BeforeNextImage = () => (
  <Image
    src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png"
    alt="Example"
    width={800}
    height={600}
    priority
  />
);

/**
 * After (with CloudinaryImage component):
 */
const AfterNextWithCloudinary = () => (
  <CloudinaryImage
    publicId="example_image"
    alt="Example"
    width={800}
    height={600}
    priority
    options={{
      crop: 'fill',
      gravity: 'center'
    }}
  />
);

/**
 * PATTERN 3: String URL replacement (e.g., in data objects)
 * 
 * Before:
 */
const beforeData = {
  image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png"
};

/**
 * After (with Cloudinary URL):
 */
const afterData = {
  image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/example_image"
};

/**
 * PATTERN 4: Using higher quality images with Cloudinary transformations
 * 
 * Before:
 */
const BeforeBasicImgHighQuality = () => (
  <img 
    src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png" 
    alt="Example" 
    className="high-quality-image"
  />
);

/**
 * After (with CloudinaryImage component and transformations):
 */
const AfterWithCloudinaryHighQuality = () => (
  <CloudinaryImage
    publicId="example_image"
    alt="Example"
    width={1600}
    height={1200}
    className="high-quality-image"
    options={{
      crop: 'fill',
      gravity: 'center',
      quality: 90
    }}
  />
);

/**
 * PATTERN 5: Background images in CSS/Tailwind
 * 
 * Before:
 */
const BeforeBackgroundImage = () => (
  <div 
    className="bg-cover bg-center h-64" 
    style={{
      backgroundImage: "url('https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png')"
    }}
  />
);

/**
 * After (with Cloudinary URL):
 */
const AfterBackgroundImage = () => (
  <div 
    className="bg-cover bg-center h-64" 
    style={{
      backgroundImage: `url('${getCloudinaryUrl("example_image", {
        width: 1200,
        height: 600,
        crop: 'fill',
        quality: 80
      })}')`
    }}
  />
);

/**
 * PATTERN 6: CSS Module or Styled Component
 * 
 * Before (in CSS):
 * 
 * .hero {
 *   background-image: url('https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133488/uncategorized/example-image-UniqueID.png');
 * }
 * 
 * After (in CSS):
 * 
 * .hero {
 *   background-image: url('https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/example_image');
 * }
 */

/**
 * PATTERN 7: Organizing Images in Folders
 * 
 * For better organization, use folders in your publicIds:
 * - services/dermatology/hero
 * - services/plastic-surgery/hero
 * - team/doctors/dr-name
 * 
 * Example:
 */
const OrganizedExample = () => (
  <CloudinaryImage
    publicId="services/dermatology/hero"
    alt="Dermatology Services"
    width={1200}
    height={600}
    options={{
      crop: 'fill',
      gravity: 'center'
    }}
  />
);

/**
 * PATTERN 8: Responsive Images
 * 
 * Cloudinary components automatically handle responsive sizes,
 * but you can also set specific breakpoints:
 */
const ResponsiveExample = () => (
  <CloudinaryImage
    publicId="example_image"
    alt="Example"
    sizes="(max-width: 768px) 100vw, 50vw"
    width={1200}
    height={800}
    options={{
      crop: 'fill',
      gravity: 'center'
    }}
  />
);

/**
 * INSTRUCTIONS:
 * 
 * 1. First run the scripts/find-vercel-blob-urls.js script to locate all Vercel Blob URLs
 * 2. For each URL:
 *    - Upload the image to Cloudinary (use scripts/migrate-image-to-cloudinary.js)
 *    - Replace the Vercel Blob URL with appropriate Cloudinary component/URL based on these templates
 * 3. Organize images in logical folders when uploading to Cloudinary
 * 4. Update the code using these patterns
 * 5. Run the script again to confirm all URLs have been replaced
 */ 