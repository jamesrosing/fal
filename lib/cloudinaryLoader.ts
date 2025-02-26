/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the unified Cloudinary module from '@/lib/cloudinary' instead.
 * It provides all the same functionality with improved typings and organization.
 */

export const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // Extract the filename from the full URL
  const filename = src.split('/').pop();
  
  // Return the Cloudinary optimized URL
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_${quality || 'auto'},w_${width}/${filename}`;
}; 