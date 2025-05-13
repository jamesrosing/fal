/**
 * @file Cloudinary utilities index
 * 
 * This file exports all Cloudinary-related utilities from a central location.
 * Use this file as the main entry point for importing Cloudinary functionality.
 */

// Re-export all utilities from the utils directory
export * from './utils';

// For backwards compatibility, provide aliased exports
import {
  getCloudinaryUrl,
  getCloudinaryVideoUrl,
  getCloudinaryImageSrcSet,
  getCloudinaryPath,
  getCloudinaryConfig,
  getCloudinaryImageProps,
  getCloudinaryPublicId,
  getMediaType,
  getPublicIdFromUrl,
  extractImageNameFromPath,
  isCloudinaryUrl,
  getFullFolderPath,
  getResponsiveSizes,
  getCloudinaryVideoSources,
  checkCloudinaryAsset,
  FOLDERS,
  type ImageArea,
  type ImageFormat,
  type VideoFormat,
  type CloudinaryImageOptions,
  type CloudinaryVideoOptions
} from './utils';

export {
  getCloudinaryUrl,
  getCloudinaryVideoUrl,
  getCloudinaryImageSrcSet,
  getCloudinaryPath,
  getCloudinaryConfig,
  getCloudinaryImageProps,
  getCloudinaryPublicId,
  getMediaType,
  getPublicIdFromUrl,
  extractImageNameFromPath,
  isCloudinaryUrl,
  getFullFolderPath,
  getResponsiveSizes,
  getCloudinaryVideoSources,
  checkCloudinaryAsset,
  FOLDERS
};

// Legacy aliases for backward compatibility
export const generateCloudinaryUrl = getCloudinaryUrl;