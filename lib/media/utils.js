import mediaRegistry from './registry.js';
import { validatePath } from './structure.js';

// Environment config
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w',
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
  
  // Try to get the asset from the registry first
  const asset = typeof idOrPublicId === 'string' ? mediaRegistry.getAsset(idOrPublicId) : null;
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  // If already a full URL, return as is
  if (publicId && typeof publicId === 'string' && publicId.startsWith('http')) {
    return publicId;
  }
  
  // Handle missing values
  if (!publicId) {
    console.warn(`Empty or invalid publicId provided: ${idOrPublicId}, returning placeholder`);
    return '/images/placeholder.jpg';
  }
  
  // Validate Cloudinary path for non-registry assets
  if (!asset) {
    const isValidPath = validatePath(publicId, 'cloudinary');
    if (!isValidPath) {
      console.warn(`Invalid Cloudinary path: ${publicId}`);
    }
  }
  
  // For images
  const {
    width = asset?.defaultOptions?.width || 'auto',
    height = 'auto',
    quality = asset?.defaultOptions?.quality || 90,
    format = asset?.defaultOptions?.format || 'auto',
    crop = 'scale',
    gravity = 'auto',
    resource_type = asset?.type || 'image'
  } = options;
  
  // Build transformation string
  const transformations = [];
  
  // Add format if specified
  if (format !== 'auto') {
    transformations.push(`f_${format}`);
  } else {
    transformations.push('f_auto');
  }
  
  // Add quality if specified
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  // Add width if specified
  if (width !== 'auto') {
    transformations.push(`w_${width}`);
  }
  
  // Add height if specified
  if (height !== 'auto') {
    transformations.push(`h_${height}`);
  }
  
  // Add crop if specified
  if (crop) {
    transformations.push(`c_${crop}`);
  }
  
  // Add gravity if specified
  if (gravity) {
    transformations.push(`g_${gravity}`);
  }
  
  // Join transformations
  const transformationString = transformations.join(',');
  
  // Construct Cloudinary URL
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resource_type}/upload/${transformationString}/${publicId}`;
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
  
  // Try to get the asset from the registry first
  const asset = typeof idOrPublicId === 'string' ? mediaRegistry.getAsset(idOrPublicId) : null;
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  // If asset not found, return a placeholder video source
  if (!asset && !publicId) {
    console.warn(`Video asset not found: ${idOrPublicId}`);
    return [{
      src: '/videos/placeholder.mp4',
      type: 'video/mp4',
      media: undefined
    }];
  }
  
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
  
  // Try to get the asset from the registry first
  const asset = typeof idOrPublicId === 'string' ? mediaRegistry.getAsset(idOrPublicId) : null;
  
  // If asset not found, try to use the publicId directly or fall back to a placeholder
  if (!asset) {
    console.warn(`Asset not found in registry: ${idOrPublicId}, trying to use as publicId`);
    
    // Try to construct default dimensions
    const width = options.width || 800;
    const height = options.height || 600;
    
    // See if we can get a URL from the ID directly
    try {
      const src = getMediaUrl(idOrPublicId, options);
      
      return {
        src,
        width,
        height,
        alt: options.alt || "",
        blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg==",
        placeholder: "blur",
      };
    } catch (error) {
      console.error(`Error generating media URL for ${idOrPublicId}:`, error);
      
      // Return a placeholder image
      return {
        src: '/images/placeholder.jpg',
        width: width,
        height: height,
        alt: options.alt || "Image not found",
        placeholder: "blur",
        blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg=="
      };
    }
  }
  
  const publicId = asset.publicId;
  
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
  
  // Check the registry
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