/**
 * Cloudinary Admin API utilities
 * This file provides functions for working with the Cloudinary Admin API
 */

export interface CloudinaryAsset {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  folder?: string;
}

export interface CloudinaryFolder {
  name: string;
  path: string;
}

export interface CloudinaryAssetsResult {
  assets: CloudinaryAsset[];
  folders: CloudinaryFolder[];
}

/**
 * Fetches all Cloudinary assets recursively
 * @param folder Optional folder path to start from
 * @returns Promise with assets and folders
 */
export async function fetchCloudinaryAssets(folder?: string): Promise<CloudinaryAssetsResult> {
  try {
    const url = `/api/cloudinary/fetch-assets${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Cloudinary assets: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Cloudinary assets:', error);
    return {
      assets: [],
      folders: [],
    };
  }
}

/**
 * Organizes Cloudinary assets into a folder structure
 * @param assets Array of Cloudinary assets
 * @param folders Array of Cloudinary folders
 * @returns Organized folder structure
 */
export function organizeAssetsByFolder(
  assets: CloudinaryAsset[],
  folders: CloudinaryFolder[]
): Record<string, CloudinaryAsset[]> {
  const folderMap: Record<string, CloudinaryAsset[]> = {};
  
  // Initialize with empty arrays for all folders
  folders.forEach((folder) => {
    folderMap[folder.path] = [];
  });
  
  // Add root folder if not already present
  if (!folderMap['']) {
    folderMap[''] = [];
  }
  
  // Organize assets by folder
  assets.forEach((asset) => {
    const folder = asset.folder || '';
    if (!folderMap[folder]) {
      folderMap[folder] = [];
    }
    folderMap[folder].push(asset);
  });
  
  return folderMap;
}

/**
 * Filters Cloudinary assets by type
 * @param assets Array of Cloudinary assets
 * @param type Type to filter by (e.g., 'image', 'video')
 * @returns Filtered assets
 */
export function filterAssetsByType(
  assets: CloudinaryAsset[],
  type: string
): CloudinaryAsset[] {
  return assets.filter((asset) => asset.resource_type === type);
}

/**
 * Searches Cloudinary assets by name
 * @param assets Array of Cloudinary assets
 * @param query Search query
 * @returns Filtered assets
 */
export function searchAssets(
  assets: CloudinaryAsset[],
  query: string
): CloudinaryAsset[] {
  const lowerQuery = query.toLowerCase();
  return assets.filter((asset) => 
    asset.public_id.toLowerCase().includes(lowerQuery)
  );
} 