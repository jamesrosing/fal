/**
 * @file Consolidated Cloudinary utilities
 * 
 * This file centralizes all Cloudinary-related utility functions to avoid duplication
 * and ensure consistent behavior across the application.
 */

// Constants
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'alluremd';

// Types
export type ImageArea = 
  | "hero"
  | "article" 
  | "service"
  | "team"
  | "gallery"
  | "logo"
  | "video-thumbnail";

export type ImageFormat = 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
export type VideoFormat = 'mp4' | 'webm' | 'mov';

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: number | string;
  format?: string;
  crop?: string;
  gravity?: string;
  effect?: string;
  simplifiedMode?: boolean;
  resource_type?: 'image' | 'video' | 'auto' | 'raw';
  blurDataURL?: string;
}

export interface CloudinaryVideoOptions {
  format?: string;
  quality?: number;
  width?: number;
}

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
 * Get Cloudinary configuration
 */
export function getCloudinaryConfig() {
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  };
}

/**
 * Generate a Cloudinary URL for a given public ID and options
 * 
 * @param publicId - The Cloudinary public ID including folder path
 * @param options - Optional transformation options
 * @returns Full Cloudinary URL with transformations
 */
export function getCloudinaryUrl(publicId: string, options: CloudinaryImageOptions | string = {}): string {
  // Handle both string and object options formats for backward compatibility
  if (typeof options === 'string') {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${options}/${publicId}`;
  }

  try {
    // Extract transformation parameters
    const width = options.width ?? null;
    const height = options.height ?? null;
    const quality = options.quality ?? 'auto';
    const format = options.format ?? 'auto';
    const crop = options.crop ?? null;
    const gravity = options.gravity ?? null;
    
    // Construct the transformation parameters
    let transformations = [];
    
    if (format) transformations.push(`f_${format}`);
    if (quality) transformations.push(`q_${quality}`);
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    
    // Join transformations with commas
    const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
    
    // Handle case where publicId already includes the base folder
    const fullPublicId = publicId.startsWith(CLOUDINARY_FOLDER)
      ? publicId
      : `${CLOUDINARY_FOLDER}/${publicId}`;
    
    // Correct URL format: https://res.cloudinary.com/{cloudName}/image/upload/{transformations}/{publicId}
    const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${fullPublicId}`;
    
    return url;
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    // Fallback to a simple URL without transformations in case of error
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  }
}

/**
 * Generate a Cloudinary URL for a video with the given public ID and options
 * 
 * @param publicId - The Cloudinary public ID for the video
 * @param options - Optional video transformation options
 * @returns Full Cloudinary video URL with transformations
 */
export function getCloudinaryVideoUrl(
  publicId: string,
  options: CloudinaryVideoOptions = {}
): string {
  const {
    format = 'auto',
    quality = 90,
    width
  } = options;

  // Handle case where publicId already includes the base folder
  const fullPublicId = publicId.startsWith(CLOUDINARY_FOLDER)
    ? publicId
    : `${CLOUDINARY_FOLDER}/${publicId}`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/f_${format},q_${quality}${width ? `,w_${width}` : ''}/${fullPublicId}`;
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
 * Gets the full Cloudinary folder path
 * 
 * @param folder - The sub-folder path
 * @returns The full folder path including the root folder
 */
export function getFullFolderPath(folder: string): string {
  return `${CLOUDINARY_FOLDER}/${folder}`;
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
 * Generates a responsive image srcset for Cloudinary images
 * 
 * @param publicId - Cloudinary public ID
 * @param options - Optional transformation options
 * @returns Formatted srcset string
 */
export function getCloudinaryImageSrcSet(publicId: string, options: CloudinaryImageOptions = {}) {
  const widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  return widths
    .map(
      (width) =>
        `${getCloudinaryUrl(publicId, { ...options, width })} ${width}w`
    )
    .join(', ');
}

/**
 * Builds a Cloudinary video source set for different formats and resolutions
 * 
 * @param publicId - Cloudinary public ID for the video
 * @param options - Options for formats, widths, and base transformations
 * @returns Array of video sources with src, type, and media attributes
 */
export function getCloudinaryVideoSources(
  publicId: string,
  options: {
    formats?: VideoFormat[];
    widths?: number[];
    baseOptions?: CloudinaryVideoOptions;
  } = {}
) {
  const formats = options.formats || ['mp4', 'webm'];
  const widths = options.widths || [480, 720, 1080];
  const baseOptions = options.baseOptions || {};
  
  return formats.flatMap(format => 
    widths.map(width => ({
      src: getCloudinaryVideoUrl(publicId, { 
        ...baseOptions, 
        format, 
        width 
      }),
      type: `video/${format}`,
      media: width <= 480 
        ? '(max-width: 480px)' 
        : width <= 720 
          ? '(max-width: 720px)' 
          : '(min-width: 721px)'
    }))
  );
}

/**
 * Gets optimized image props for use with Next.js Image component
 * 
 * @param publicId - Cloudinary public ID
 * @param options - Optional transformation options
 * @returns Props object for Next.js Image component
 */
export function getCloudinaryImageProps(publicId: string, options: CloudinaryImageOptions = {}) {
  return {
    src: getCloudinaryUrl(publicId, options),
    width: options.width || 800,
    height: options.height || 600,
    alt: "",
    blurDataURL: getCloudinaryUrl(publicId, {
      width: 10,
      quality: 30,
      format: 'webp'
    }),
    placeholder: "blur",
  };
}

/**
 * Parses a Cloudinary URL to extract the public ID
 * 
 * @param url - Cloudinary URL to parse
 * @returns The extracted public ID or the original URL if not a Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    // Extract the upload/ part and everything after it
    const uploadParts = url.split('upload/');
    if (uploadParts.length < 2) return url;
    
    // If there are transformations, they'll be in the format: t1,t2,t3/publicId
    const transformationAndPublicId = uploadParts[1];
    
    // Split by / to separate transformations from public ID
    const parts = transformationAndPublicId.split('/');
    
    // If the first part contains commas, it's likely transformations
    // Otherwise, the whole string is the public ID
    if (parts[0].includes(',')) {
      return parts.slice(1).join('/');
    } else {
      return transformationAndPublicId;
    }
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return url;
  }
}

/**
 * Extracts the image name from a path or URL
 * 
 * @param path - The image path (can be a URL or a relative path)
 * @returns The extracted image name without folder structure or extension
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

/**
 * Extracts the complete Cloudinary public ID from a URL
 * 
 * @param url - Cloudinary URL to parse
 * @returns The complete public ID or null if not a valid Cloudinary URL
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Direct public ID
    if (!url.includes('cloudinary.com')) {
      return url;
    }
    
    // For full Cloudinary URLs
    // Example: https://res.cloudinary.com/demo/image/upload/v1612447684/sample.jpg
    const uploadPattern = /cloudinary\.com\/[^\/]+\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(uploadPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // Alternative approach if the regex fails
    const parts = url.split('/upload/');
    if (parts.length >= 2) {
      const afterUpload = parts[1];
      
      // Remove any file extension
      const withoutExtension = afterUpload.replace(/\.\w+$/, '');
      
      // Remove version if present
      return withoutExtension.replace(/^v\d+\//, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error, url);
    return null;
  }
}

/**
 * Determine the media type from a Cloudinary ID or URL
 * 
 * @param cloudinaryId - The Cloudinary public ID or URL
 * @returns The media type ('image' or 'video')
 */
export function getMediaType(cloudinaryId: string): 'image' | 'video' {
  if (!cloudinaryId) return 'image';
  
  // Check for common video extensions
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
  const hasVideoExtension = videoExtensions.some(ext => 
    cloudinaryId.toLowerCase().endsWith(ext)
  );
  
  // Check for video folders in the path
  const isInVideoFolder = cloudinaryId.includes('/video/') || 
                         cloudinaryId.includes('/videos/');
  
  return (hasVideoExtension || isInVideoFolder) ? 'video' : 'image';
}

// Helper function to check if an asset exists in Cloudinary
export async function checkCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}