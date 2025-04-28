/**
 * Cloudinary OG Image Utilities
 * 
 * This module provides utility functions for generating Open Graph images
 * using Cloudinary's transformation capabilities.
 */

interface TextOptions {
  text: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  position?: 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
}

interface OverlayOptions {
  publicId: string;
  position?: { gravity: string };
  effects?: { opacity?: number; blur?: number }[];
}

interface OgImageOptions {
  publicId: string;
  text?: TextOptions;
  overlays?: OverlayOptions[];
  width?: number;
  height?: number;
  crop?: string;
  backgroundColor?: string;
}

/**
 * Create a Cloudinary URL directly without requiring the cloudinary-core library
 * 
 * @param publicId The public ID of the asset
 * @param transformations Array of transformation objects
 * @returns URL string with transformations
 */
function createCloudinaryUrl(publicId: string, transformations: any[]): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  
  // Base URL
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Add transformations
  if (transformations.length > 0) {
    const transformationString = transformations
      .map(transform => {
        return Object.entries(transform)
          .map(([key, value]) => {
            // Handle nested objects like overlay
            if (key === 'overlay' && typeof value === 'object') {
              return `l_${(value as any).public_id || 'text:' + encodeURIComponent((value as any).text || '')}`;
            }
            // Handle standard transformations
            return `${key.replace(/_/g, '-')}${value ? '_' + value : ''}`;
          })
          .join(',');
      })
      .join('/');
    
    url += '/' + transformationString;
  }
  
  // Add public ID
  url += '/' + publicId;
  
  return url;
}

/**
 * Generate a Cloudinary URL for an Open Graph image with text and overlays
 * 
 * @param options Configuration for the OG image
 * @returns URL string for the transformed image
 * 
 * @example
 * const ogImageUrl = generateOgImageUrl({
 *   publicId: 'folder/image',
 *   text: {
 *     text: 'Article Title',
 *     color: 'white',
 *     fontSize: 70
 *   },
 *   overlays: [{
 *     publicId: 'logo/brand',
 *     position: { gravity: 'south_east' }
 *   }]
 * });
 */
export function generateOgImageUrl(options: OgImageOptions): string {
  const { publicId, text, overlays, width, height, crop, backgroundColor } = options;
  
  let transformations: any[] = [];
  
  // Add base transformations
  if (width || height || crop) {
    transformations.push({
      w: width || 1200,
      h: height || 630,
      c: crop || 'fill'
    });
  }
  
  // Add background color if specified
  if (backgroundColor) {
    transformations.push({
      b: backgroundColor.replace('#', '')
    });
  }
  
  // Add text overlay if provided
  if (text) {
    transformations.push({
      overlay: {
        text: encodeURIComponent(text.text)
      },
      font_family: text.fontFamily || 'Arial',
      font_size: text.fontSize || 60,
      font_weight: text.fontWeight || 'bold',
      color: text.color?.replace('#', '') || 'white',
      gravity: text.position || 'center'
    });
  }
  
  // Add image overlays if provided
  if (overlays && overlays.length > 0) {
    overlays.forEach(overlay => {
      const overlayTransform: any = {
        overlay: {
          public_id: overlay.publicId
        },
        gravity: overlay.position?.gravity || 'center'
      };
      
      // Add effects if available
      if (overlay.effects) {
        overlay.effects.forEach(effect => {
          if (effect.opacity !== undefined) {
            overlayTransform.opacity = effect.opacity;
          }
          if (effect.blur !== undefined) {
            overlayTransform.blur = effect.blur;
          }
        });
      }
      
      transformations.push(overlayTransform);
    });
  }
  
  // Format as auto and set quality to auto for optimal delivery
  transformations.push({
    f: 'auto',
    q: 'auto'
  });
  
  return createCloudinaryUrl(publicId, transformations);
}

/**
 * Generate a simple article OG image with title and logo
 * 
 * @param title The article title
 * @param imagePublicId The Cloudinary public ID of the background image
 * @param logoPublicId Optional Cloudinary public ID of the logo
 * @returns URL string for the OG image
 */
export function generateArticleOgImage(title: string, imagePublicId: string, logoPublicId?: string): string {
  const options: OgImageOptions = {
    publicId: imagePublicId,
    width: 1200,
    height: 630,
    crop: 'fill',
    text: {
      text: title,
      color: 'white',
      fontSize: 60,
      fontWeight: 'bold',
      position: 'center'
    }
  };
  
  if (logoPublicId) {
    options.overlays = [
      {
        publicId: logoPublicId,
        position: { gravity: 'south_east' },
        effects: [{ opacity: 80 }]
      }
    ];
  }
  
  return generateOgImageUrl(options);
}

/**
 * Generate a gallery OG image with title and multiple image overlays
 * 
 * @param title The gallery title
 * @param imagePublicIds Array of Cloudinary public IDs to use as overlays
 * @param logoPublicId Optional Cloudinary public ID of the logo
 * @returns URL string for the OG image
 */
export function generateGalleryOgImage(title: string, imagePublicIds: string[], logoPublicId?: string): string {
  // Use first image as background or a default color
  const baseImage = imagePublicIds.length > 0 ? imagePublicIds[0] : null;
  
  const options: OgImageOptions = {
    publicId: baseImage || 'placeholder',
    width: 1200,
    height: 630,
    crop: 'fill',
    backgroundColor: baseImage ? undefined : '#f0f0f0',
    text: {
      text: title,
      color: 'white',
      fontSize: 60,
      fontWeight: 'bold',
      position: 'north'
    },
    overlays: []
  };
  
  // If a logo is provided, add it as an overlay
  if (logoPublicId) {
    options.overlays = [
      ...(options.overlays || []),
      {
        publicId: logoPublicId,
        position: { gravity: 'south_east' },
        effects: [{ opacity: 80 }]
      }
    ];
  }
  
  return generateOgImageUrl(options);
}

export default {
  generateOgImageUrl,
  generateArticleOgImage,
  generateGalleryOgImage
}; 