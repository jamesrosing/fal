/**
 * Unified Cloudinary utility module
 * This file provides a consistent interface for working with Cloudinary
 * resources across both client and server environments.
 * 
 * IMPORTANT: The following files are now deprecated and should be removed after migration:
 * - lib/cloudinary-client.ts (functionality moved here)
 * - lib/cloudinary-upload.ts (functionality moved here)
 * - lib/cloudinaryLoader.ts (exported from here)
 */

// Client-side configuration
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// Add type declaration for the Cloudinary Upload Widget
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (options: any, callback: (error: any, result: any) => void) => any;
      createMediaLibrary: (options: any, callbacks?: any) => any;
    };
  }
}

// Type definitions
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
  quality?: number;
  format?: string;
  crop?: string;
  gravity?: string;
  simplifiedMode?: boolean;
  resource_type?: 'image' | 'video' | 'auto' | 'raw';
}

export interface CloudinaryVideoOptions {
  format?: string;
  quality?: number;
  width?: number;
}

export interface CloudinaryAsset {
  publicId: string;
  area: ImageArea;
  width: number;
  height: number;
  format: string;
  resourceType: 'image' | 'video';
  tags?: string[];
  context?: Record<string, string>;
}

export interface ImagePlacement {
  path: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  transformations: string[];
}

/**
 * Interface for organizing Cloudinary assets with tags, folders, and context
 */
export interface OrganizeOptions {
  publicIds: string[];
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  addTags?: boolean; // Whether to add tags or replace existing ones
}

export const IMAGE_PLACEMENTS: Record<ImageArea, ImagePlacement> = {
  hero: {
    path: "hero",
    description: "Main hero images for section headers",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  article: {
    path: "articles",
    description: "Article header images",
    dimensions: {
      width: 1200,
      height: 675,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  service: {
    path: "services",
    description: "Service category images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  team: {
    path: "team/headshots",
    description: "Team member headshots",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    transformations: ["c_fill", "g_face", "f_auto", "q_auto"]
  },
  gallery: {
    path: "gallery",
    description: "Gallery images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  logo: {
    path: "branding",
    description: "Logo and branding assets",
    dimensions: {
      width: 200,
      height: 0,
      aspectRatio: 0
    },
    transformations: ["c_scale", "f_auto", "q_auto"]
  },
  "video-thumbnail": {
    path: "videos/thumbnails",
    description: "Thumbnails for videos",
    dimensions: {
      width: 1280,
      height: 720,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  }
};

// Helper function to generate Cloudinary URLs
export const getCloudinaryUrl = (
  publicId: string,
  options: CloudinaryImageOptions = {}
) => {
  // If publicId is already a full URL (starts with http or https), return it as is
  if (publicId && (publicId.startsWith('http://') || publicId.startsWith('https://'))) {
    console.log('URL already provided, skipping Cloudinary transformation:', publicId);
    return publicId;
  }

  // If publicId is empty or undefined, return a placeholder image
  if (!publicId) {
    console.warn('Empty publicId provided, returning placeholder image');
    return 'https://via.placeholder.com/800x600?text=Image+Not+Found';
  }

  const {
    width = 'auto',
    height = 'auto',
    quality = 90,
    format = 'auto',
    crop = 'scale',
    gravity = 'auto',
    simplifiedMode = false
  } = options;

  // For simplified mode, use fewer transformations
  if (simplifiedMode) {
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${publicId}`;
  }

  try {
    // Use a more conservative set of transformations to reduce the chance of errors
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/f_${format},q_${quality}${width !== 'auto' ? `,w_${width}` : ''}/${publicId}`;
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return 'https://via.placeholder.com/800x600?text=Image+Not+Found';
  }
};

// Helper function for video URLs
export const getCloudinaryVideoUrl = (
  publicId: string,
  options: CloudinaryVideoOptions = {}
) => {
  const {
    format = 'auto',
    quality = 90,
    width
  } = options;

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/video/upload/f_${format},q_${quality}${width ? `,w_${width}` : ''}/${publicId}`;
};

// Helper function to check if an asset exists in Cloudinary
export const checkCloudinaryAsset = async (publicId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${publicId}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Gets optimized image props for use with Next.js Image component
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
 * Generates a responsive image srcset for Cloudinary images
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
 * Client-side function for uploading files to Cloudinary via the /api/upload endpoint
 * @deprecated Use the CloudinaryUploader component instead
 */
export async function uploadToCloudinary(
  file: File,
  area: ImageArea,
  section?: string,
  customFilename?: string
) {
  try {
    console.log(`Starting upload to Cloudinary: area=${area}, section=${section}, filename=${customFilename || file.name}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area', area);
    if (section) formData.append('section', section);
    if (customFilename) formData.append('filename', customFilename);

    console.log('Sending request to /api/upload endpoint with formData keys:', Array.from(formData.keys()));
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Response from /api/upload:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(Array.from(response.headers.entries()))
    });

    if (!response.ok) {
      let errorData: { error?: string; rawResponse?: string } = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        // Try to get the response as text if JSON parsing fails
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        errorData = { rawResponse: textResponse };
      }
      
      console.error('Upload error response details:', {
        status: response.status,
        errorData
      });
      
      throw new Error(
        errorData.error ? 
        `Upload failed: ${errorData.error}` : 
        `Upload failed with status ${response.status}`
      );
    }

    const result = await response.json();
    console.log('Upload successful, result:', result);
    return result;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

/**
 * Client-side function for deleting files from Cloudinary
 */
export async function deleteFromCloudinary(public_id: string) {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id }),
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Delete error response:', result);
      throw new Error(result.error || 'Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error instanceof Error ? error : new Error('Delete failed');
  }
}

/**
 * Interface for Cloudinary Upload Widget options
 */
export interface UploadWidgetOptions {
  cloudName?: string;
  uploadPreset?: string;
  folder?: string;
  tags?: string[];
  context?: string;
  resourceType?: 'image' | 'video' | 'auto' | 'raw';
  multiple?: boolean;
  maxFiles?: number;
  cropping?: boolean;
  croppingAspectRatio?: number;
  showAdvancedOptions?: boolean;
  sources?: Array<'local' | 'url' | 'camera' | 'google_drive' | 'dropbox' | 'instagram' | 'shutterstock' | 'facebook' | 'unsplash'>;
  defaultSource?: 'local' | 'url' | 'camera' | 'google_drive' | 'dropbox' | 'instagram' | 'shutterstock' | 'facebook' | 'unsplash';
  useUploadPreset?: boolean;
}

/**
 * Initialize and open the Cloudinary Upload Widget
 */
export function initUploadWidget(options: UploadWidgetOptions, callback: (error: any, result: any) => void) {
  // This function should only run client-side
  if (typeof window === 'undefined') {
    throw new Error('initUploadWidget can only be used in client-side code');
  }

  // Ensure widget script is loaded
  if (!window.cloudinary) {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);
  }

  // Initialize widget when script is ready
  const checkWidgetReady = setInterval(() => {
    if (window.cloudinary) {
      clearInterval(checkWidgetReady);
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || options.cloudName;
      
      // Base widget options without authentication yet
      const widgetOptions: Record<string, any> = {
        cloudName,
        folder: options.folder || '',
        tags: options.tags || [],
        resourceType: options.resourceType || 'auto',
        multiple: options.multiple !== undefined ? options.multiple : true,
        maxFiles: options.maxFiles || 10,
        cropping: options.cropping !== undefined ? options.cropping : false,
        croppingAspectRatio: options.croppingAspectRatio,
        showAdvancedOptions: options.showAdvancedOptions !== undefined ? options.showAdvancedOptions : false,
        sources: options.sources || ['local', 'url', 'camera'],
        defaultSource: options.defaultSource || 'local',
      };
      
      // Authentication approach:
      // 1. If useUploadPreset is true and an uploadPreset is provided, use that preset directly
      // 2. Otherwise, use server-side signature generation
      if (options.useUploadPreset) {
        // Use unsigned upload with preset
        const uploadPreset = options.uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        console.log('Using unsigned upload with preset:', uploadPreset);
        widgetOptions.uploadPreset = uploadPreset;
      } else {
        // Use signed upload with server authentication
        console.log('Using signed upload with server authentication');
        
        // Important: For signed uploads, we should NOT include an upload_preset
        // as it will conflict with the signature
        widgetOptions.uploadSignature = generateSignatureCallback;
      }
      
      // Create and open the widget
      console.log('Creating upload widget with options:', { ...widgetOptions, cloudName });
      const widget = window.cloudinary.createUploadWidget(widgetOptions, callback);
      widget.open();
      return widget;
    }
  }, 250);
}

/**
 * Function to generate a signature for Cloudinary uploads
 * This is used by the Upload Widget for signed uploads
 */
async function generateSignatureCallback(callback: Function, params: Record<string, any>) {
  try {
    console.log('Widget requesting signature for params:', params);
    
    // Create form data with ALL parameters from the widget
    // This is critical to match what Cloudinary expects in the signature
    const formData = new FormData();
    for (const key in params) {
      formData.append(key, params[key]);
    }
    
    // Call our API route to generate a signature
    console.log('Calling /api/cloudinary/signed-upload');
    const response = await fetch('/api/cloudinary/signed-upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from signature endpoint:', errorData);
      callback(null); // This will cause the widget to use its own signing
      return;
    }
    
    const data = await response.json();
    console.log('Signature response from server:', data);
    
    // Return EXACTLY these parameters in this format
    // Cloudinary widget expects these specific keys
    const signatureData: Record<string, any> = {
      signature: data.signature,
      api_key: data.api_key,
      timestamp: data.timestamp
    };
    
    // Add any additional parameters from the original widget request
    // (except those that are handled separately)
    for (const key in params) {
      if (key !== 'timestamp' && key !== 'api_key' && key !== 'callback') {
        signatureData[key] = params[key];
      }
    }
    
    console.log('Returning signature data to widget:', signatureData);
    callback(signatureData);
  } catch (error) {
    console.error('Error generating signature:', error);
    // Return null to let the widget try its default approach
    callback(null);
  }
}

// For backwards compatibility, load the cloudinaryLoader on demand
export async function cloudinaryLoader(params: {src: string; width: number; quality?: number}) {
  // This is now a dynamic function that avoids importing from the cloudinaryLoader module
  const { src, width, quality = 75 } = params;
  
  // Extract the filename from the full URL
  const filename = src.split('/').pop() || '';
  
  // Return the Cloudinary optimized URL
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_${quality},w_${width}/${filename}`;
}

/**
 * Verifies that all required Cloudinary assets exist
 */
export async function verifyRequiredAssets() {
  const requiredAssets = [
    'hero/hero-poster',
    'hero/hero-fallback',
    'hero/hero-articles'
  ];

  console.log('Verifying required Cloudinary assets...');
  
  for (const asset of requiredAssets) {
    const exists = await checkCloudinaryAsset(asset);
    console.log(`${asset}: ${exists ? '✅ Found' : '❌ Missing'}`);
    
    if (!exists) {
      console.log(`Please upload ${asset} to Cloudinary`);
      console.log(`Expected path: ${asset}`);
      console.log('---');
    }
  }
}

/**
 * Determine the media type from a Cloudinary ID or URL
 * @param cloudinaryId The Cloudinary public ID or URL
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

// Add a utility function to detect if a Cloudinary asset is a video
export const isCloudinaryVideo = (publicId: string): boolean => {
  if (!publicId) return false;
  
  // Check common video extensions
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  const hasVideoExtension = videoExtensions.some(ext => publicId.toLowerCase().includes(ext));
  
  // Check for video resource type indicators in the URL
  const isVideoResource = publicId.includes('/video/') || 
                          publicId.includes('resource_type=video');
  
  return hasVideoExtension || isVideoResource;
}; 