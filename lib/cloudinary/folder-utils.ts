// Constants
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'alluremd';

/**
 * Common Cloudinary folder paths used in the application
 */
export const FOLDERS = {
  // Pages
  HOME: 'pages/home',
  ABOUT: 'pages/about',
  CONTACT: 'pages/contact',
  GALLERY: 'pages/gallery',
  
  // Services
  SERVICES: 'services',
  DERMATOLOGY: 'services/dermatology',
  MEDICAL_SPA: 'services/medical-spa',
  PLASTIC_SURGERY: 'services/plastic-surgery',
  FUNCTIONAL_MEDICINE: 'services/functional-medicine',
  
  // Gallery sections
  EMSCULPT_GALLERY: 'gallery/emsculpt',
  FACIALS_GALLERY: 'gallery/facials',
  PLASTIC_SURGERY_GALLERY: 'gallery/plastic-surgery',
  
  // Global assets
  ICONS: 'global/icons',
  LOGOS: 'global/logos',
  UI: 'global/ui',
  
  // Components
  COMPONENTS: 'components',
  HERO: 'components/hero',
  CARDS: 'components/cards',
  
  // Team
  TEAM: 'team/headshots',
  
  // Videos
  VIDEOS: 'videos',
  BACKGROUNDS: 'videos/backgrounds',
  CONTENT_VIDEOS: 'videos/content',
  
  // Content types
  ARTICLES: 'articles',
};

/**
 * Get a full Cloudinary URL for a public ID
 * 
 * @param publicId - The Cloudinary public ID including folder path
 * @param transformations - Optional transformations to apply
 * @returns Full Cloudinary URL
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: string = 'f_auto,q_auto'
): string {
  // Handle case where publicId already includes the base folder
  const fullPublicId = publicId.startsWith(CLOUDINARY_FOLDER)
    ? publicId
    : `${CLOUDINARY_FOLDER}/${publicId}`;
    
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${fullPublicId}`;
}

/**
 * Construct a Cloudinary folder path with optional subfolder and filename
 * 
 * @param folder - The base folder path (can use FOLDERS constants)
 * @param subfolder - Optional subfolder name
 * @param filename - Optional filename without extension
 * @returns Properly formatted Cloudinary public ID
 */
export function getCloudinaryPath(
  folder: string,
  subfolder?: string,
  filename?: string
): string {
  // Construct the path based on provided parameters
  let path = folder;
  
  if (subfolder) {
    path = `${path}/${subfolder}`;
  }
  
  if (filename) {
    path = `${path}/${filename}`;
  }
  
  return path;
}

/**
 * Get a list of common image sizes for responsive images
 * 
 * @param baseWidth - Base width for desktop
 * @returns Object with various size breakpoints
 */
export function getResponsiveSizes(baseWidth = 800): { [key: string]: number } {
  return {
    xs: Math.round(baseWidth * 0.25),
    sm: Math.round(baseWidth * 0.5),
    md: Math.round(baseWidth * 0.75),
    lg: baseWidth,
    xl: Math.round(baseWidth * 1.5),
    xxl: Math.round(baseWidth * 2)
  };
}

/**
 * Generate a srcset string for responsive images
 * 
 * @param publicId - Cloudinary public ID
 * @param baseWidth - Base width for desktop
 * @returns srcset string for responsive images
 */
export function getCloudinarySrcSet(publicId: string, baseWidth = 800): string {
  const sizes = getResponsiveSizes(baseWidth);
  return Object.entries(sizes)
    .map(([_, width]) => {
      const url = getCloudinaryUrl(publicId, `f_auto,q_auto,w_${width}`);
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Gets the full Cloudinary folder path
 * 
 * @param folder - The sub-folder path
 * @returns The full folder path including the root folder
 */
export function getFullFolderPath(folder: string): string {
  return `${CLOUDINARY_FOLDER}/${folder}`;
}

/**
 * Extracts the image name from a path
 * 
 * @param path - The image path (can be a URL or a relative path)
 * @returns The extracted image name without folder structure
 */
export function extractImageNameFromPath(path: string): string {
  if (!path) return '';
  
  // Handle full Cloudinary URLs
  if (path.includes('cloudinary.com')) {
    // Extract the last part of the URL path (after the last slash)
    const urlParts = path.split('/');
    return urlParts[urlParts.length - 1].split('.')[0]; // Remove file extension
  }
  
  // Handle relative paths or public IDs
  const pathParts = path.split('/');
  return pathParts[pathParts.length - 1].split('.')[0]; // Remove file extension
}

/**
 * Checks if a string is a Cloudinary URL
 * 
 * @param url - The URL to check
 * @returns True if the URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return !!url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'));
} 