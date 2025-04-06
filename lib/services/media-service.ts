// lib/services/media-service.ts
import { createClient } from '@/lib/supabase';
import { cache } from 'react';
import mediaRegistry from '@/lib/media/registry';
import { getMediaUrl } from '@/lib/media/utils';

// Type definitions
export interface MediaAsset {
  id: string;
  cloudinary_id: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  format?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaMapping {
  id: string;
  placeholder_id: string;
  media_id: string;
  created_at: string;
  updated_at: string;
}

export interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
  gravity?: string;
}

export interface VideoOptions extends MediaOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
}

/**
 * MediaService - A unified service for managing media assets
 * 
 * This service provides a centralized way to:
 * - Fetch media by placeholder ID
 * - Update media mappings
 * - Generate optimized media URLs
 * - Handle responsive images and videos
 */
class MediaService {
  /**
   * Get a media asset by its placeholder ID
   * This is cached to minimize database calls
   */
  getMediaByPlaceholderId = cache(async (placeholderId: string): Promise<MediaAsset | null> => {
    // First try to get from registry (in-memory)
    const registryAsset = mediaRegistry.getAsset(placeholderId);
    if (registryAsset) {
      return {
        id: registryAsset.id,
        cloudinary_id: registryAsset.publicId,
        type: registryAsset.type as 'image' | 'video',
        title: registryAsset.description,
        alt_text: registryAsset.description,
        metadata: {},
        width: registryAsset.dimensions?.width,
        height: registryAsset.dimensions?.height,
        format: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    // Otherwise query the database
    const supabase = createClient();
    
    // First get the mapping
    const { data: mapping, error: mappingError } = await supabase
      .from('media_mappings')
      .select('media_id')
      .eq('placeholder_id', placeholderId)
      .single();
      
    if (mappingError || !mapping) {
      console.error(`Error fetching mapping for placeholder ${placeholderId}:`, mappingError);
      return null;
    }
    
    // Then get the media asset
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', mapping.media_id)
      .single();
      
    if (mediaError || !mediaAsset) {
      console.error(`Error fetching media asset ${mapping.media_id}:`, mediaError);
      return null;
    }
    
    return mediaAsset as MediaAsset;
  });
  
  /**
   * Get multiple media assets by placeholder IDs
   */
  async getMediaByPlaceholderIds(placeholderIds: string[]): Promise<Record<string, MediaAsset | null>> {
    const result: Record<string, MediaAsset | null> = {};
    
    // Fetch all in parallel
    const promises = placeholderIds.map(async (id) => {
      result[id] = await this.getMediaByPlaceholderId(id);
    });
    
    await Promise.all(promises);
    return result;
  }
  
  /**
   * Get a complete URL for a media asset
   */
  getMediaUrl(asset: MediaAsset | null, options: MediaOptions = {}): string {
    if (!asset) return '/placeholder-image.jpg';
    
    return getMediaUrl(asset.cloudinary_id, {
      ...options,
      resource_type: asset.type
    });
  }
  
  /**
   * Get a complete URL for a media asset by placeholder ID
   */
  async getMediaUrlByPlaceholderId(placeholderId: string, options: MediaOptions = {}): Promise<string> {
    const asset = await this.getMediaByPlaceholderId(placeholderId);
    return this.getMediaUrl(asset, options);
  }
  
  /**
   * Update a media mapping
   */
  async updateMediaMapping(placeholderId: string, cloudinaryId: string, metadata: Record<string, any> = {}): Promise<boolean> {
    const supabase = createClient();
    
    try {
      // Check if media asset already exists
      const { data: existingAsset } = await supabase
        .from('media_assets')
        .select('id')
        .eq('cloudinary_id', cloudinaryId)
        .single();
      
      let mediaId: string;
      
      if (existingAsset) {
        // Update existing asset with new metadata
        mediaId = existingAsset.id;
        await supabase
          .from('media_assets')
          .update({
            metadata: { ...metadata },
            updated_at: new Date().toISOString()
          })
          .eq('id', mediaId);
      } else {
        // Create new media asset
        const assetType = this.detectAssetType(cloudinaryId);
        const { data: newAsset, error: assetError } = await supabase
          .from('media_assets')
          .insert({
            cloudinary_id: cloudinaryId,
            type: assetType,
            metadata: { ...metadata },
            title: metadata.title || placeholderId,
            alt_text: metadata.alt_text || placeholderId
          })
          .select()
          .single();
          
        if (assetError || !newAsset) {
          console.error('Error creating media asset:', assetError);
          return false;
        }
        
        mediaId = newAsset.id;
      }
      
      // Check if mapping exists
      const { data: existingMapping } = await supabase
        .from('media_mappings')
        .select('id')
        .eq('placeholder_id', placeholderId)
        .single();
        
      if (existingMapping) {
        // Update existing mapping
        await supabase
          .from('media_mappings')
          .update({
            media_id: mediaId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMapping.id);
      } else {
        // Create new mapping
        await supabase
          .from('media_mappings')
          .insert({
            placeholder_id: placeholderId,
            media_id: mediaId
          });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating media mapping:', error);
      return false;
    }
  }
  
  /**
   * Detect the type of asset from its ID or URL
   */
  detectAssetType(cloudinaryId: string): 'image' | 'video' {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      cloudinaryId.toLowerCase().endsWith(ext)
    );
    
    const isVideoResource = cloudinaryId.includes('/video/') || 
                           cloudinaryId.includes('resource_type=video');
    
    return (hasVideoExtension || isVideoResource) ? 'video' : 'image';
  }
  
  /**
   * Get responsive image sources for different screen sizes
   */
  getResponsiveImageSources(asset: MediaAsset | null, options: MediaOptions = {}): Array<{
    src: string;
    width: number;
  }> {
    if (!asset) return [];
    
    const widths = [320, 640, 768, 1024, 1280, 1536, 1920];
    
    return widths.map(width => ({
      src: this.getMediaUrl(asset, { ...options, width }),
      width
    }));
  }
  
  /**
   * Get video sources for different formats and resolutions
   */
  getVideoSources(asset: MediaAsset | null, options: VideoOptions = {}): Array<{
    src: string;
    type: string;
    width: number;
  }> {
    if (!asset || asset.type !== 'video') return [];
    
    const formats = ['mp4', 'webm'];
    const widths = [480, 720, 1080];
    
    return formats.flatMap(format => 
      widths.map(width => ({
        src: this.getMediaUrl(asset, { 
          ...options, 
          format, 
          width,
          resource_type: 'video'
        }),
        type: `video/${format}`,
        width
      }))
    );
  }
}

// Export singleton instance
export const mediaService = new MediaService();
