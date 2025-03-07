import { createClient } from '@/lib/supabase';
import { MediaPlaceholder } from './media-map';

/**
 * Media Assets Helper Functions
 * 
 * These functions help manage the media assets for the site.
 * They handle the association between media placeholders and Cloudinary public IDs.
 * 
 * @see https://next.cloudinary.dev/ for Next Cloudinary documentation
 */

// Types
export interface MediaAsset {
  id: string;
  placeholder_id: string;
  cloudinary_id: string;
  area: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get a media asset by placeholder ID
 * @param placeholderId The ID of the media placeholder
 * @returns The media asset or null if not found
 */
export async function getMediaAsset(placeholderId: string): Promise<MediaAsset | null> {
  try {
    const supabase = createClient();
    
    // Query the media_assets table
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('placeholder_id', placeholderId)
      .single();
    
    if (error) {
      console.error('Error getting media asset:', error);
      return null;
    }
    
    return data as MediaAsset;
  } catch (error) {
    console.error('Error getting media asset:', error);
    return null;
  }
}

/**
 * Get all media assets
 * @returns An array of media assets
 */
export async function getAllMediaAssets(): Promise<MediaAsset[]> {
  try {
    const supabase = createClient();
    
    // Query the media_assets table
    const { data, error } = await supabase
      .from('media_assets')
      .select('*');
    
    if (error) {
      console.error('Error getting all media assets:', error);
      return [];
    }
    
    return data as MediaAsset[];
  } catch (error) {
    console.error('Error getting all media assets:', error);
    return [];
  }
}

/**
 * Update a media asset
 * @param placeholderId The ID of the media placeholder
 * @param cloudinaryId The Cloudinary public ID
 * @returns The updated media asset or null if the update failed
 */
export async function updateMediaAsset(
  placeholderId: string, 
  cloudinaryId: string
): Promise<MediaAsset | null> {
  try {
    const supabase = createClient();
    
    // Check if the asset already exists
    const existingAsset = await getMediaAsset(placeholderId);
    
    if (existingAsset) {
      // Update the existing asset
      const { data, error } = await supabase
        .from('media_assets')
        .update({
          cloudinary_id: cloudinaryId,
          updated_at: new Date().toISOString(),
        })
        .eq('placeholder_id', placeholderId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating media asset:', error);
        return null;
      }
      
      return data as MediaAsset;
    } else {
      // Create a new asset
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          placeholder_id: placeholderId,
          cloudinary_id: cloudinaryId,
          area: placeholderId.split('/')[0] || 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating media asset:', error);
        return null;
      }
      
      return data as MediaAsset;
    }
  } catch (error) {
    console.error('Error updating media asset:', error);
    return null;
  }
}

/**
 * Delete a media asset
 * @param placeholderId The ID of the media placeholder
 * @returns True if the deletion was successful, false otherwise
 */
export async function deleteMediaAsset(placeholderId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Delete the asset
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('placeholder_id', placeholderId);
    
    if (error) {
      console.error('Error deleting media asset:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return false;
  }
} 