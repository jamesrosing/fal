/**
 * Consolidated utility for generating Cloudinary URLs
 * This removes duplication and ensures consistent URL generation across the app
 */

import { CloudinaryImageOptions } from './cloudinary';

/**
 * Generate a Cloudinary URL with proper formatting and error handling
 */
export function generateCloudinaryUrl(publicId: string, options: CloudinaryImageOptions = {}): string {
  if (!publicId) return '';
  
  try {
    // Normalize publicId to handle different input formats
    const normalizedId = normalizePublicId(publicId);
    
    // Extract transformation parameters
    const {
      width = null,
      height = null,
      quality = 'auto',
      format = 'auto',
      crop = null,
      gravity = null,
      effect = null,
      simplifiedMode = false,
    } = options;
    
    // Cloud name from env
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
    
    // Base URL
    const baseUrl = `https://res.cloudinary.com/${cloudName}`;
    
    // Resource type (image or video)
    const resourceType = options.resource_type || 'image';
    
    // Build transformation string
    const transformations = [];
    
    if (format) transformations.push(`f_${format}`);
    if (quality) transformations.push(`q_${quality}`);
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity) transformations.push(`g_${gravity}`);
    if (effect) transformations.push(`e_${effect}`);
    
    // Join transformations with commas
    const transformationString = transformations.length > 0 ? 
      transformations.join(',') + '/' : '';
    
    // Construct URL
    let url;
    
    if (simplifiedMode) {
      // Simple mode - no version, direct path
      url = `${baseUrl}/${resourceType}/upload/${transformationString}${normalizedId}`;
    } else {
      // Normal mode - include version if not already in ID
      const hasVersion = normalizedId.includes('v') && /v\d+/.test(normalizedId);
      
      if (hasVersion) {
        url = `${baseUrl}/${resourceType}/upload/${transformationString}${normalizedId}`;
      } else {
        url = `${baseUrl}/${resourceType}/upload/${transformationString}v1743748610/${normalizedId}`;
      }
    }
    
    return url;
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return '';
  }
}

/**
 * Helper to normalize publicId by extracting it from URLs if needed
 */
function normalizePublicId(input: string): string {
  if (!input) return '';
  
  // Already a normal ID (not a URL)
  if (!input.includes('cloudinary.com') && !input.includes('/upload/')) {
    return input;
  }
  
  // Extract from URL
  try {
    if (input.includes('cloudinary.com')) {
      const urlParts = input.split('/upload/');
      if (urlParts.length < 2) return input;
      
      // Get last part after /upload/
      const uploadPart = urlParts[urlParts.length - 1];
      
      // Check for transformations
      const parts = uploadPart.split('/');
      if (parts[0].includes(',')) {
        return parts.slice(1).join('/');
      }
      return uploadPart;
    }
  } catch (e) {
    console.error('Error normalizing Cloudinary ID:', e);
  }
  
  return input;
}

/**
 * Generate optimized video URL for Cloudinary
 */
export function generateCloudinaryVideoUrl(
  publicId: string, 
  options: { format?: string; quality?: number; width?: number } = {}
): string {
  if (!publicId) return '';
  
  try {
    const {
      format = 'mp4',
      quality = 90,
      width = null
    } = options;
    
    // Build transformations
    const transformations = [];
    transformations.push(`f_${format}`);
    transformations.push(`q_${quality}`);
    if (width) transformations.push(`w_${width}`);
    
    // Join transformations
    const transformationString = transformations.join(',') + '/';
    
    // Normalize publicId
    const normalizedId = normalizePublicId(publicId);
    
    // Cloud name from env
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
    
    // Generate URL
    return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}${normalizedId}`;
  } catch (error) {
    console.error('Error generating Cloudinary video URL:', error);
    return '';
  }
}

/**
 * Generate a poster image URL from a video
 */
export function generateVideoPosterUrl(
  publicId: string,
  options: { format?: string; quality?: number; width?: number } = {}
): string {
  if (!publicId) return '';
  
  try {
    const {
      format = 'jpg',
      quality = 80,
      width = undefined
    } = options;
    
    // Remove extension if present
    const baseId = publicId.replace(/\.(mp4|webm|mov)$/, '');
    
    // Create poster ID
    const posterId = `${baseId}.jpg`;
    
    // Generate image URL
    return generateCloudinaryUrl(posterId, {
      format,
      quality,
      width,
      resource_type: 'image'
    });
  } catch (error) {
    console.error('Error generating video poster URL:', error);
    return '';
  }
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: CloudinaryImageOptions = {}
): string {
  if (!publicId) return '';
  
  try {
    return widths
      .map(width => {
        const url = generateCloudinaryUrl(publicId, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  } catch (error) {
    console.error('Error generating srcset:', error);
    return '';
  }
}

/**
 * Check if a string is a Cloudinary video ID
 */
export function isVideoPublicId(publicId: string): boolean {
  if (!publicId) return false;
  
  return publicId.endsWith('.mp4') || 
         publicId.endsWith('.webm') || 
         publicId.endsWith('.mov') ||
         publicId.includes('/video/') ||
         publicId.includes('/videos/');
} 