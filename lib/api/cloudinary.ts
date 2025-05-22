import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK
cloudinary.config({
cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
secure: true,
});

// Type for upload options
export interface CloudinaryUploadOptions {
folder?: string;
public_id?: string;
tags?: string[];
resource_type?: 'image' | 'video' | 'raw' | 'auto';
overwrite?: boolean;
transformation?: any[];
}

// Type for search options
export interface CloudinarySearchOptions {
expression: string;
max_results?: number;
next_cursor?: string;
sort_by?: { [key: string]: 'asc' | 'desc' };
with_field?: string[];
}

/**
* Upload a file to Cloudinary
*/
export const uploadToCloudinary = async (
file: string | Buffer,
options: CloudinaryUploadOptions = {}
) => {
try {
const result = await cloudinary.uploader.upload(file, {
resource_type: options.resource_type || 'auto',
folder: options.folder,
public_id: options.public_id,
tags: options.tags,
overwrite: options.overwrite !== undefined ? options.overwrite : true,
transformation: options.transformation,
});

return { result, error: null };
} catch (error) {
console.error('Cloudinary upload error:', error);
return {
result: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to upload to Cloudinary',
};
}
};

/**
* Search for assets in Cloudinary
*/
export const searchCloudinaryAssets = async (options: CloudinarySearchOptions) => {
try {
const result = await cloudinary.search
.expression(options.expression)
.max_results(options.max_results || 100)
.with_field(options.with_field || ['context', 'tags'])
.sort_by(options.sort_by || { created_at: 'desc' })
.next_cursor(options.next_cursor || '')
.execute();

return { result, error: null };
} catch (error) {
console.error('Cloudinary search error:', error);
return {
result: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to search Cloudinary assets',
};
}
};

/**
* Generate a signed URL for a Cloudinary asset
*/
export const generateSignedUrl = (publicId: string, options: any = {}) => {
return cloudinary.url(publicId, {
secure: true,
sign_url: true,
...options,
});
};

/**
* Delete a Cloudinary asset
*/
export const deleteCloudinaryAsset = async (publicId: string, resource_type: 'image' | 'video' = 'image') => {
try {
const result = await cloudinary.uploader.destroy(publicId, { resource_type });
return { result, error: null };
} catch (error) {
console.error('Cloudinary delete error:', error);
return {
result: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to delete Cloudinary asset',
};
}
};

/**
* Create a folder in Cloudinary
*/
export const createCloudinaryFolder = async (folderPath: string) => {
try {
// Cloudinary doesn't have a direct API for creating folders
// Folders are created implicitly when uploading files
// This is a workaround to create an empty folder
const result = await cloudinary.uploader.upload(
'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==', // Simple base64 text
{
folder: folderPath,
public_id: '.placeholder',
resource_type: 'raw',
}
);
return { result, error: null };
} catch (error) {
console.error('Cloudinary folder creation error:', error);
return {
result: null,
error: typeof error === 'object' && error !== null && 'message' in error
? String(error.message)
: 'Failed to create Cloudinary folder',
};
}
};