import mediaRegistry from './media/registry';
import { getMediaUrl as getMUrl } from './media/utils';
import { MediaOptions } from './media/types';

/**
 * Gets the Cloudinary URL for a media ID
 * This is a wrapper around the getMediaUrl function in media/utils
 * Used for migration from hardcoded URLs to media IDs
 */
export function mediaUrl(id: string, options: MediaOptions = {}): string {
  return getMUrl(id, options);
}

/**
 * Creates a media ID string for use in component props
 * This function is used for migration from hardcoded URLs
 */
export function mediaId(id: string): string {
  // Clean up the ID to ensure it's formatted correctly
  const cleanId = id
    .replace(/\.\w+$/, '') // Remove file extension
    .replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
  
  // For usage with next/image component, paths need to start with a slash
  return '/' + cleanId;
}

/**
 * Dynamically generates a media URL with parameter substitution
 * Used for migrating template literals with dynamic values
 * Example: getMediaUrl("products/{category}/{id}") 
 */
export function getMediaUrl(template: string, options: MediaOptions = {}): string {
  // This would be used at runtime to dynamically generate URLs
  // For migration purposes, we simplify 
  return template;
}

/**
 * Register a media asset in the registry
 * This is useful for migration when we discover new assets
 */
export function registerMediaAsset(id: string, publicId: string): void {
  // For now just log this - actual registration would happen in the registry
  console.log(`Registering media asset: ${id} -> ${publicId}`);
} 