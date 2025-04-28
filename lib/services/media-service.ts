// lib/services/media-service.ts
import { createClient } from '@/lib/supabase';
import { cache } from 'react';
import mediaRegistry from '@/lib/media/registry';
import { getMediaUrl } from '@/lib/media/utils';

// Type definitions
export interface MediaAsset {
  id: string;
  public_id: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  format?: string;
  tags?: string[];
  metadata?: Record<string, any>;
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
 * Media Service
 * 
 * This service handles interactions with the media_assets table in Supabase
 * and provides utilities for managing Cloudinary resources.
 */
export class MediaService {
  /**
   * Get a media asset by its public ID
   * 
   * @param publicId The Cloudinary public ID of the asset
   * @returns The media asset or null if not found
   */
  getMediaByPublicId = cache(async (publicId: string): Promise<MediaAsset | null> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('public_id', publicId)
      .single();
      
    if (error || !data) {
      console.error(`Error fetching media asset with public ID ${publicId}:`, error);
      return null;
    }
    
    return data as MediaAsset;
  });
  
  /**
   * Get multiple media assets by their public IDs
   * 
   * @param publicIds Array of Cloudinary public IDs
   * @returns Record mapping public IDs to their media assets
   */
  async getMediaByPublicIds(publicIds: string[]): Promise<Record<string, MediaAsset | null>> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .in('public_id', publicIds);
    
    if (error) {
      console.error('Error fetching multiple media assets:', error);
      return {};
    }
    
    const result: Record<string, MediaAsset | null> = {};
    publicIds.forEach(id => {
      result[id] = data?.find(asset => asset.public_id === id) || null;
    });
    
    return result;
  }
  
  /**
   * Add or update a media asset
   * 
   * @param asset Media asset data to upsert
   * @returns The created or updated media asset
   */
  async upsertMediaAsset(asset: Partial<MediaAsset> & { public_id: string }): Promise<MediaAsset | null> {
    const supabase = createClient();
    
    // Check if the asset already exists
    const { data: existingAsset } = await supabase
      .from('media_assets')
      .select('id')
      .eq('public_id', asset.public_id)
      .single();
    
    if (existingAsset) {
      // Update existing asset
      const { data, error } = await supabase
        .from('media_assets')
        .update({
          ...asset,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating media asset ${asset.public_id}:`, error);
        return null;
      }
      
      return data as MediaAsset;
    } else {
      // Create new asset
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          ...asset,
          type: asset.type || 'image'
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating media asset ${asset.public_id}:`, error);
        return null;
      }
      
      return data as MediaAsset;
    }
  }
  
  /**
   * Delete a media asset by its public ID
   * 
   * @param publicId The Cloudinary public ID of the asset to delete
   * @returns True if successful, false otherwise
   */
  async deleteMediaAsset(publicId: string): Promise<boolean> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('public_id', publicId);
    
    if (error) {
      console.error(`Error deleting media asset ${publicId}:`, error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Search for media assets
   * 
   * @param query Search query
   * @param type Optional filter by media type
   * @param limit Maximum number of results to return
   * @returns Array of matching media assets
   */
  async searchMedia(query: string, type?: 'image' | 'video', limit = 20): Promise<MediaAsset[]> {
    const supabase = createClient();
    
    let queryBuilder = supabase
      .from('media_assets')
      .select('*')
      .or(`title.ilike.%${query}%,alt_text.ilike.%${query}%,public_id.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`Error searching for media assets:`, error);
      return [];
    }
    
    return data as MediaAsset[];
  }
  
  /**
   * Get media assets for a gallery
   * 
   * @param galleryId UUID of the gallery
   * @returns Array of media assets associated with the gallery
   */
  async getGalleryMedia(galleryId: string): Promise<MediaAsset[]> {
    const supabase = createClient();
    
    // First get all albums in the gallery
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('id')
      .eq('gallery_id', galleryId);
    
    if (albumsError || !albums || albums.length === 0) {
      console.error(`Error fetching albums for gallery ${galleryId}:`, albumsError);
      return [];
    }
    
    // Get all cases in these albums
    const albumIds = albums.map(album => album.id);
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id')
      .in('album_id', albumIds);
    
    if (casesError || !cases || cases.length === 0) {
      console.error(`Error fetching cases for albums:`, casesError);
      return [];
    }
    
    // Get all case_images
    const caseIds = cases.map(c => c.id);
    const { data: caseImages, error: caseImagesError } = await supabase
      .from('case_images')
      .select('media_id')
      .in('case_id', caseIds);
    
    if (caseImagesError || !caseImages || caseImages.length === 0) {
      console.error(`Error fetching case images:`, caseImagesError);
      return [];
    }
    
    // Get media assets
    const mediaIds = caseImages.map(img => img.media_id);
    const { data: media, error: mediaError } = await supabase
      .from('media_assets')
      .select('*')
      .in('id', mediaIds);
    
    if (mediaError || !media) {
      console.error(`Error fetching media assets:`, mediaError);
      return [];
    }
    
    return media as MediaAsset[];
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;
