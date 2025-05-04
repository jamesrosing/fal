import { createClient } from './supabase';

/**
 * Fetches a Cloudinary public ID from Supabase based on a placeholder ID or returns the direct ID
 * @param idOrPlaceholderId The ID of the placeholder or a direct Cloudinary ID
 * @returns The Cloudinary public ID or null if not found
 */
export async function getMediaPublicId(idOrPlaceholderId: string): Promise<string | null> {
  // If it looks like a Cloudinary ID (contains a slash), return it directly
  if (idOrPlaceholderId.includes('/')) {
    return idOrPlaceholderId;
  }
  
  const supabase = createClient();
  
  // First try to find in media_assets by legacy_placeholder_id in metadata
  const { data: metadataData, error: metadataError } = await supabase
    .from('media_assets')
    .select('public_id')
    .filter('metadata->legacy_placeholder_id', 'eq', idOrPlaceholderId)
    .maybeSingle();
    
  if (!metadataError && metadataData) {
    return metadataData.public_id;
  }
  
  // Next, check if the ID is a direct public_id in the media_assets table
  const { data, error } = await supabase
    .from('media_assets')
    .select('public_id')
    .eq('public_id', idOrPlaceholderId)
    .maybeSingle();
  
  if (!error && data) {
    return data.public_id;
  }
  
  // Legacy: Try to find in media_assets_old table
  try {
    const { data: oldData, error: oldError } = await supabase
      .from('media_assets_old')
      .select('cloudinary_id')
      .eq('placeholder_id', idOrPlaceholderId)
      .maybeSingle();
      
    if (!oldError && oldData) {
      return oldData.cloudinary_id;
    }
  } catch (err) {
    console.warn('Error checking media_assets_old table:', err);
  }
  
  // If no data is found, return null
  console.warn(`No media asset found for ID: ${idOrPlaceholderId}`);
  
  // For now, return a default placeholder based on the placeholder ID
  // This is a temporary solution until proper media assets are set up
  return getDefaultPublicId(idOrPlaceholderId);
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
 * Fetches multiple Cloudinary public IDs from Supabase based on an array of placeholder IDs or direct IDs
 * @param ids Array of IDs (placeholder IDs or direct Cloudinary IDs)
 * @returns Object with IDs as keys and Cloudinary public IDs as values
 */
export async function getMediaPublicIds(ids: string[]): Promise<Record<string, string>> {
  // Split IDs into direct IDs (contain slashes) and placeholder IDs
  const directIds = ids.filter(id => id.includes('/'));
  const placeholderIds = ids.filter(id => !id.includes('/'));
  
  // Create result object with direct IDs mapped to themselves
  const result: Record<string, string> = {};
  directIds.forEach(id => result[id] = id);
  
  if (placeholderIds.length === 0) {
    return result;
  }
  
  const supabase = createClient();
  
  // First check media_assets table by legacy_placeholder_id in metadata
  try {
    const { data: metadataData, error: metadataError } = await supabase
      .rpc('filter_by_legacy_placeholder_ids', { placeholder_ids: placeholderIds });
      
    if (!metadataError && metadataData) {
      metadataData.forEach((item: any) => {
        result[item.legacy_placeholder_id] = item.public_id;
      });
    }
  } catch (err) {
    console.warn('Error checking legacy placeholder IDs:', err);
  }
  
  // Filter remaining IDs that haven't been mapped yet
  const remainingIds = placeholderIds.filter(id => !result[id]);
  
  if (remainingIds.length > 0) {
    // Legacy: Try media_assets_old table
    try {
      const { data, error } = await supabase
        .from('media_assets_old')
        .select('placeholder_id, cloudinary_id')
        .in('placeholder_id', remainingIds);
        
      if (!error && data) {
        data.forEach(item => {
          result[item.placeholder_id] = item.cloudinary_id;
        });
      }
    } catch (err) {
      console.warn('Error fetching from media_assets_old:', err);
    }
  }
  
  return result;
}

/**
 * Updates or creates a media asset mapping in Supabase using the new media_assets table
 * @param idOrPlaceholderId The ID of the placeholder or direct ID
 * @param cloudinaryId The Cloudinary public ID
 * @param metadata Optional metadata for the media asset
 * @returns Success status
 */
export async function updateMediaAsset(
  idOrPlaceholderId: string, 
  cloudinaryId: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  const supabase = createClient();
  
  // Determine if the asset is a video
  const isVideo = 
    cloudinaryId.includes('/video/') || 
    /\.(mp4|webm|avi|mov|wmv)$/i.test(cloudinaryId) ||
    metadata.type === 'video';
  
  try {
    // Check if this ID exists as a legacy_placeholder_id in metadata
    const { data: existingMetadataData } = await supabase
      .from('media_assets')
      .select('id')
      .filter('metadata->legacy_placeholder_id', 'eq', idOrPlaceholderId)
      .maybeSingle();
      
    if (existingMetadataData) {
      // Update existing record
      const { error } = await supabase
        .from('media_assets')
        .update({ 
          public_id: cloudinaryId,
          type: isVideo ? 'video' : 'image',
          metadata: {
            ...metadata,
            legacy_placeholder_id: idOrPlaceholderId
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMetadataData.id);
        
      if (error) {
        console.error('Error updating media asset in media_assets:', error);
        return false;
      }
      
      return true;
    }
    
    // Check if a record exists with this public_id
    const { data: existingPublicData } = await supabase
      .from('media_assets')
      .select('id')
      .eq('public_id', cloudinaryId)
      .maybeSingle();
      
    if (existingPublicData) {
      // Update to include the legacy placeholder ID
      const { error } = await supabase
        .from('media_assets')
        .update({
          metadata: {
            ...metadata,
            legacy_placeholder_id: idOrPlaceholderId
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPublicData.id);
        
      if (error) {
        console.error('Error updating media asset metadata:', error);
        return false;
      }
      
      return true;
    }
    
    // Insert new record
    const { error } = await supabase
      .from('media_assets')
      .insert({
        public_id: cloudinaryId,
        type: isVideo ? 'video' : 'image',
        title: metadata.title || idOrPlaceholderId,
        alt_text: metadata.alt_text || metadata.title || idOrPlaceholderId,
        width: metadata.width || null,
        height: metadata.height || null,
        metadata: {
          ...metadata,
          legacy_placeholder_id: idOrPlaceholderId
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error inserting media asset:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateMediaAsset:', err);
    return false;
  }
}

/**
 * Deletes a media asset mapping from Supabase
 * @param idOrPlaceholderId The ID of the placeholder or direct Cloudinary ID to delete
 * @returns Success status
 */
export async function deleteMediaAsset(idOrPlaceholderId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    if (idOrPlaceholderId.includes('/')) {
      // It's a direct Cloudinary ID, delete by public_id
      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('public_id', idOrPlaceholderId);
        
      if (error) {
        console.error('Error deleting media asset by public_id:', error);
        return false;
      }
    } else {
      // It's a placeholder ID, delete by legacy_placeholder_id in metadata
      const { data, error } = await supabase
        .from('media_assets')
        .select('id')
        .filter('metadata->legacy_placeholder_id', 'eq', idOrPlaceholderId)
        .maybeSingle();
        
      if (error) {
        console.error('Error finding media asset by legacy_placeholder_id:', error);
        return false;
      }
      
      if (data) {
        const { error: deleteError } = await supabase
          .from('media_assets')
          .delete()
          .eq('id', data.id);
          
        if (deleteError) {
          console.error('Error deleting media asset by id:', deleteError);
          return false;
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteMediaAsset:', err);
    return false;
  }
} 