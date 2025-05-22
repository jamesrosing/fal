import { type MediaAsset } from '../types/media';

/**
* Format file size for display
*/
export const formatFileSize = (bytes: number): string => {
if (bytes === 0) return '0 Bytes';

const k = 1024;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));

return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
* Extract dimensions from Cloudinary URL or public ID
*/
export const extractDimensionsFromUrl = (url: string): { width: number; height: number } | null => {
// Default dimensions if extraction fails
const defaultDimensions = { width: 800, height: 600 };

try {
// Try to extract dimensions from Cloudinary transformation URL
const match = url.match(/\/c_fill,h_(\d+),w_(\d+)\//);
if (match && match[1] && match[2]) {
return {
height: parseInt(match[1], 10),
width: parseInt(match[2], 10),
};
}

return defaultDimensions;
} catch (error) {
console.error('Error extracting dimensions:', error);
return defaultDimensions;
}
};

/**
* Generate a blurhash placeholder from Cloudinary
*/
export const getCloudinaryPlaceholder = (publicId: string, width = 100): string => {
return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},e_blur:1000/${publicId}`;
};

/**
* Group media assets by folder structure
*/
export const groupMediaByFolder = (
mediaAssets: MediaAsset[]
): Record<string, MediaAsset[]> => {
const grouped: Record<string, MediaAsset[]> = {};

mediaAssets.forEach((asset) => {
// Extract folder path from public_id
const pathParts = asset.public_id.split('/');
const folderPath = pathParts.length > 1
? pathParts.slice(0, -1).join('/')
: 'root';

if (!grouped[folderPath]) {
grouped[folderPath] = [];
}

grouped[folderPath].push(asset);
});

return grouped;
};

/**
* Filter media assets by type and tags
*/
export const filterMediaAssets = (
assets: MediaAsset[],
filters: {
type?: 'image' | 'video' | 'all';
tags?: string[];
search?: string;
}
): MediaAsset[] => {
return assets.filter((asset) => {
// Filter by type
if (filters.type && filters.type !== 'all' && asset.type !== filters.type) {
return false;
}

// Filter by tags
if (filters.tags && filters.tags.length > 0) {
if (!asset.tags || !asset.tags.some(tag => filters.tags?.includes(tag))) {
return false;
}
}

// Filter by search term
if (filters.search && filters.search.trim() !== '') {
const searchTerm = filters.search.toLowerCase();
const searchableFields = [
asset.title,
asset.alt_text,
asset.public_id,
...(asset.tags || []),
].filter(Boolean).map(item => item?.toLowerCase());

if (!searchableFields.some(field => field && field.includes(searchTerm))) {
return false;
}
}

return true;
});
};