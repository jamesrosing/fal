import { MediaOptions, VideoOptions, MediaAsset } from './types';
import mediaRegistry from './registry';
import { getCloudinaryUrl, getCloudinaryVideoUrl, getCloudinaryImageSrcSet } from '@/lib/cloudinary';

// Environment config
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w',
};

/**
 * Creates a properly formatted media URL with transformations
 */
export function getMediaUrl(
  idOrPublicId: string,
  options: MediaOptions = {}
): string {
  // Check if it's an asset ID first
  const asset = mediaRegistry.getAsset(idOrPublicId);
  let publicId = asset ? asset.publicId : idOrPublicId;
  
  // If already a full URL, return as is
  if (publicId.startsWith('http')) {
    return publicId;
  }
  
  // Handle missing values
  if (!publicId) {
    console.warn('Empty publicId provided, returning placeholder');
    return 'https://via.placeholder.com/800x600?text=Image+Not+Found';
  }
  
  // Strip prefix for Cloudinary usage
  if (publicId.startsWith('page:')) {
    // Local file from /public/images/pages/
    // Not suitable for Cloudinary - show placeholder
    console.warn(`Image ${publicId} is a local file, not a Cloudinary image`);
    return `/images/pages/${publicId.replace('page:', '')}`;
  }
  
  if (publicId.startsWith('component:')) {
    // Local file from component assets
    // Not suitable for Cloudinary - show placeholder
    console.warn(`Image ${publicId} is a component asset, not a Cloudinary image`);
    return `/components/${publicId.replace('component:', '')}`;
  }
  
  // For images
  const {
    width = asset?.defaultOptions.width || 'auto',
    height = 'auto',
    quality = asset?.defaultOptions.quality || 90,
    format = asset?.defaultOptions.format || 'auto',
    crop = 'scale',
    gravity = 'auto',
    resource_type = asset?.type || 'image'
  } = options;
  
  // Use the centralized Cloudinary functions based on resource type
  if (resource_type === 'video') {
    return getCloudinaryVideoUrl(publicId, {
      format: format as any,
      quality: quality as any,
      width: width !== 'auto' ? width as number : undefined
    });
  } else {
    return getCloudinaryUrl(publicId, {
      width: width !== 'auto' ? width as number : undefined,
      height: height !== 'auto' ? height as number : undefined,
      quality: quality as any,
      format: format as any,
      crop: crop as any,
      gravity: gravity as any,
    });
  }
}

/**
 * Get video sources for different formats and resolutions
 */
export function getVideoSources(
  idOrPublicId: string,
  options: {
    formats?: string[];
    widths?: number[];
    baseOptions?: VideoOptions;
  } = {}
): Array<{ src: string; type: string; media?: string }> {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const formats = options.formats || ['mp4', 'webm'];
  const widths = options.widths || [480, 720, 1080];
  const baseOptions = options.baseOptions || {};
  
  return formats.flatMap(format => 
    widths.map(width => ({
      src: getCloudinaryVideoUrl(publicId, { 
        ...baseOptions, 
        format: format as any, 
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
 * Gets all properties needed for Next.js Image component
 */
export function getNextImageProps(idOrPublicId: string, options: MediaOptions = {}) {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const width = options.width || asset?.dimensions?.width || 800;
  const height = options.height || asset?.dimensions?.height || 
    (asset?.dimensions?.aspectRatio ? Math.round(width / asset.dimensions.aspectRatio) : 600);
  
  return {
    src: getCloudinaryUrl(publicId, options),
    width,
    height,
    alt: options.alt || asset?.description || "",
    blurDataURL: getCloudinaryUrl(publicId, {
      width: 10,
      quality: 30,
      format: 'webp'
    }),
    placeholder: "blur",
  };
}

/**
 * Detect media type from ID or URL
 */
export function getMediaType(idOrPublicId: string): 'image' | 'video' {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  if (asset) return asset.type;
  
  // Check extensions and paths
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
  const hasVideoExtension = videoExtensions.some(ext => 
    idOrPublicId.toLowerCase().endsWith(ext)
  );
  
  const isVideoResource = idOrPublicId.includes('/video/') || 
                          idOrPublicId.includes('resource_type=video');
  
  return (hasVideoExtension || isVideoResource) ? 'video' : 'image';
} 