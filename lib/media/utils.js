import mediaRegistry from './registry.js';
import { validatePath } from './structure.js';

// Environment config
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

/**
 * Checks if an ID is for a component-specific asset
 */
function isComponentAsset(id) {
  return id && typeof id === 'string' && id.startsWith('component:');
}

/**
 * Checks if an ID is for a page-specific asset
 */
function isPageAsset(id) {
  return id && typeof id === 'string' && id.startsWith('page:');
}

/**
 * Get the URL for a component-specific asset
 */
function getComponentAssetUrl(id) {
  // Strip the component: prefix
  const assetPath = id.replace('component:', '');
  
  // Validate the path against our structure
  const isValidPath = validatePath(assetPath, 'components');
  if (!isValidPath) {
    console.warn(`Invalid component asset path: ${assetPath}`);
  }
  
  // For simplicity, we'll assume the path is relative to the public folder
  return `/${assetPath}`;
}

/**
 * Get the URL for a page-specific asset
 */
function getPageAssetUrl(id) {
  // Strip the page: prefix and split the path
  const assetPath = id.replace('page:', '');
  
  // If the path doesn't include "images/pages", prepend it
  const fullPath = assetPath.startsWith('images/pages') ? 
    assetPath : 
    `images/pages/${assetPath}`;
  
  // Validate the path against our structure
  const isValidPath = validatePath(fullPath, 'public');
  if (!isValidPath) {
    console.warn(`Invalid page asset path: ${fullPath}`);
  }
  
  return `/${fullPath}`;
}

/**
 * Creates a properly formatted media URL with transformations
 */
export function getMediaUrl(
  idOrPublicId,
  options = {}
) {
  // Check if it's a component-specific asset
  if (isComponentAsset(idOrPublicId)) {
    return getComponentAssetUrl(idOrPublicId);
  }
  
  // Check if it's a page-specific asset
  if (isPageAsset(idOrPublicId)) {
    return getPageAssetUrl(idOrPublicId);
  }
  
  // Check if it's an asset ID first
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  // If already a full URL, return as is
  if (publicId.startsWith('http')) {
    return publicId;
  }
  
  // Handle missing values
  if (!publicId) {
    console.warn('Empty publicId provided, returning placeholder');
    return 'https://via.placeholder.com/800x600?text=Image+Not+Found';
  }
  
  // Validate Cloudinary path
  if (!asset) {
    const isValidPath = validatePath(publicId, 'cloudinary');
    if (!isValidPath) {
      console.warn(`Invalid Cloudinary path: ${publicId}`);
    }
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
  
  // Build transformation string
  const transformations = `f_${format},q_${quality}${width !== 'auto' ? `,w_${width}` : ''}`;
  
  // Construct Cloudinary URL
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName || 'demo'}/${resource_type}/upload/${transformations}/${publicId}`;
}

/**
 * Get video sources for different formats and resolutions
 */
export function getVideoSources(
  idOrPublicId,
  options = {}
) {
  // Check if it's a component-specific asset
  if (isComponentAsset(idOrPublicId)) {
    // For component assets, we'll just return a single source with the local path
    return [{
      src: getComponentAssetUrl(idOrPublicId),
      type: 'video/mp4', // Default to mp4 for local videos
      media: undefined
    }];
  }
  
  // Check if it's a page-specific asset
  if (isPageAsset(idOrPublicId)) {
    // For page assets, we'll just return a single source with the local path
    return [{
      src: getPageAssetUrl(idOrPublicId),
      type: 'video/mp4', // Default to mp4 for local videos
      media: undefined
    }];
  }
  
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const formats = options.formats || ['mp4', 'webm'];
  const widths = options.widths || [480, 720, 1080];
  const baseOptions = options.baseOptions || {};
  
  return formats.flatMap(format => 
    widths.map(width => ({
      src: getMediaUrl(publicId, { 
        ...baseOptions, 
        format,
        width,
        resource_type: 'video'
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
export function getNextImageProps(idOrPublicId, options = {}) {
  // Check if it's a component-specific asset
  if (isComponentAsset(idOrPublicId)) {
    return {
      src: getComponentAssetUrl(idOrPublicId),
      width: options.width || 800,
      height: options.height || 600,
      alt: options.alt || "",
      placeholder: "blur", // For local images, we'd need to generate blur data
      blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg=="
    };
  }
  
  // Check if it's a page-specific asset
  if (isPageAsset(idOrPublicId)) {
    return {
      src: getPageAssetUrl(idOrPublicId),
      width: options.width || 800,
      height: options.height || 600,
      alt: options.alt || "",
      placeholder: "blur", // For local images, we'd need to generate blur data
      blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg=="
    };
  }
  
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const width = options.width || asset?.dimensions?.width || 800;
  const height = options.height || asset?.dimensions?.height || 
    (asset?.dimensions?.aspectRatio ? Math.round(width / asset.dimensions.aspectRatio) : 600);
  
  return {
    src: getMediaUrl(publicId, options),
    width,
    height,
    alt: options.alt || asset?.description || "",
    blurDataURL: getMediaUrl(publicId, {
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
export function getMediaType(idOrPublicId) {
  // Check if it's a component-specific asset
  if (isComponentAsset(idOrPublicId)) {
    // Determine type based on file extension
    const assetPath = idOrPublicId.replace('component:', '');
    
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      assetPath.toLowerCase().endsWith(ext)
    );
    
    return hasVideoExtension ? 'video' : 'image';
  }
  
  // Check if it's a page-specific asset
  if (isPageAsset(idOrPublicId)) {
    // Determine type based on file extension
    const assetPath = idOrPublicId.replace('page:', '');
    
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      assetPath.toLowerCase().endsWith(ext)
    );
    
    return hasVideoExtension ? 'video' : 'image';
  }
  
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