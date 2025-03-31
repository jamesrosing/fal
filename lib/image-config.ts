import { getCloudinaryUrl, ImageArea } from './cloudinary';
import { MediaAsset } from './media/types';

// Define the ImageAsset type
export interface ImageAsset {
  id: string;
  area: ImageArea;
  description: string;
  publicId: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  defaultOptions: {
    width: number;
    quality: number;
  };
}

// This file will be populated with all image assets as they are migrated
// Sample structure:
export const IMAGE_ASSETS: Record<string, Omit<MediaAsset, 'type'>> = {
  'hero-1': {
    id: 'hero-1',
    area: 'hero',
    description: 'Main hero image',
    publicId: 'hero/main-hero-image',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1920,
      quality: 90,
      format: 'auto'
    }
  },
  // Additional assets will be added here
};

export default IMAGE_ASSETS;

// Helper function to get optimized image URL
export function getImageUrl(assetId: string, options: { width?: number; height?: number; quality?: number } = {}) {
  const asset = IMAGE_ASSETS[assetId];
  if (!asset) {
    throw new Error(`Image asset not found: ${assetId}`);
  }
  
  // Merge default options with provided options
  const finalOptions = {
    ...asset.defaultOptions,
    ...options
  };
  
  return getCloudinaryUrl(asset.publicId, finalOptions);
}

// Helper function to update image URL after upload
export function updateImageAsset(assetId: string, newPublicId: string) {
  if (IMAGE_ASSETS[assetId]) {
    IMAGE_ASSETS[assetId].publicId = newPublicId;
  }
}

// Helper function to register a new image asset
export function registerImageAsset(asset: ImageAsset) {
  IMAGE_ASSETS[asset.id] = asset;
} 