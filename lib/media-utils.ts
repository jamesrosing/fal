import { createClient } from './supabase';

/**
 * Fetches a Cloudinary public ID from Supabase based on a placeholder ID
 * @param placeholderId The ID of the placeholder to fetch the media for
 * @returns The Cloudinary public ID or null if not found
 */
export async function getMediaPublicId(placeholderId: string): Promise<string | null> {
  const supabase = createClient();
  
  // Don't use .single() to avoid the error when no rows are found
  const { data, error } = await supabase
    .from('media_assets')
    .select('cloudinary_id')
    .eq('placeholder_id', placeholderId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors
  
  if (error) {
    console.error('Error fetching media asset:', error);
    return null;
  }
  
  // If no data is found, return null
  if (!data) {
    console.warn(`No media asset found for placeholder ID: ${placeholderId}`);
    
    // For now, return a default placeholder based on the placeholder ID
    // This is a temporary solution until proper media assets are set up
    return getDefaultPublicId(placeholderId);
  }
  
  return data.cloudinary_id;
}

/**
 * Returns a default Cloudinary public ID based on the placeholder ID
 * This is a temporary solution until proper media assets are set up
 */
function getDefaultPublicId(placeholderId: string): string {
  // Map of placeholder IDs to default Cloudinary public IDs
  const defaultMap: Record<string, string> = {
    'Out of Town Patients': 'hero/out-of-town-hero',
    'Pendry Newport Beach': 'gallery/pendry-newport-beach',
    'The Resort at Pelican Hill': 'gallery/pelican-hill-resort',
    'Lido House, Autograph Collection': 'gallery/lido-house'
  };
  
  // Return the mapped default or a generic placeholder
  return defaultMap[placeholderId] || 'general/placeholder';
}

/**
 * Fetches multiple Cloudinary public IDs from Supabase based on an array of placeholder IDs
 * @param placeholderIds Array of placeholder IDs to fetch media for
 * @returns Object with placeholder IDs as keys and Cloudinary public IDs as values
 */
export async function getMediaPublicIds(placeholderIds: string[]): Promise<Record<string, string>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('media_assets')
    .select('placeholder_id, cloudinary_id')
    .in('placeholder_id', placeholderIds);
  
  if (error || !data) {
    console.error('Error fetching media assets:', error);
    return {};
  }
  
  // Convert array to object with placeholder_id as keys and cloudinary_id as values
  return data.reduce((acc, item) => {
    acc[item.placeholder_id] = item.cloudinary_id;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Updates or creates a media asset mapping in Supabase
 * @param placeholderId The ID of the placeholder
 * @param cloudinaryId The Cloudinary public ID
 * @param metadata Optional metadata for the media asset
 * @returns Success status
 */
export async function updateMediaAsset(
  placeholderId: string, 
  cloudinaryId: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  const supabase = createClient();
  
  // Check if the placeholder already exists
  const { data: existingData } = await supabase
    .from('media_assets')
    .select('placeholder_id')
    .eq('placeholder_id', placeholderId)
    .single();
  
  if (existingData) {
    // Update existing record
    const { error } = await supabase
      .from('media_assets')
      .update({ 
        cloudinary_id: cloudinaryId,
        metadata,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'system'
      })
      .eq('placeholder_id', placeholderId);
    
    if (error) {
      console.error('Error updating media asset:', error);
      return false;
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('media_assets')
      .insert({
        placeholder_id: placeholderId,
        cloudinary_id: cloudinaryId,
        metadata,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'system'
      });
    
    if (error) {
      console.error('Error inserting media asset:', error);
      return false;
    }
  }
  
  return true;
}

/**
 * Deletes a media asset mapping from Supabase
 * @param placeholderId The ID of the placeholder to delete
 * @returns Success status
 */
export async function deleteMediaAsset(placeholderId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('placeholder_id', placeholderId);
  
  if (error) {
    console.error('Error deleting media asset:', error);
    return false;
  }
  
  return true;
} 