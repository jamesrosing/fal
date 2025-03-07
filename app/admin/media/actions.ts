'use server';

import { updateMediaAsset } from '@/lib/media-assets';
import { revalidatePath } from 'next/cache';

/**
 * Handle media upload server action
 * 
 * This function updates a media asset in the database and revalidates the media page.
 * 
 * @param placeholderId - The ID of the media placeholder
 * @param publicId - The Cloudinary public ID of the uploaded asset
 * @returns An object indicating success or failure
 */
export async function handleMediaUpload(placeholderId: string, publicId: string) {
  try {
    // Update the media asset in the database
    await updateMediaAsset(placeholderId, publicId);
    
    // Revalidate the media map
    revalidatePath('/admin/media');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating media asset:', error);
    return { success: false, error };
  }
} 