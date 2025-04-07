// lib/services/media-service.ts
import { cache } from 'react';
import { createClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as qAuto } from '@cloudinary/url-gen/qualifiers/quality';

// Types matching database schema described in documentation
export interface MediaAsset {
  id: string; // UUID
  cloudinary_id: string; // Cloudinary public ID
  type: 'image' | 'video';
  title?: string | null;
  alt_text?: string | null;
  metadata?: Record<string, any> | null; // JSONB
  width?: number | null;
  height?: number | null;
  format?: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface MediaMapping {
  id: string; // UUID
  placeholder_id: string; // Unique text identifier
  media_id: string; // Foreign key to media_assets.id
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: string | 'auto';
  // Add other transformation options as needed from Cloudinary
}

class MediaService {
  private supabase = createClient();
  private cloudinary: Cloudinary;
  // In-memory cache for resolved media assets
  private assetCache = new Map<string, MediaAsset | null>();
  private mappingCache = new Map<string, string | null>(); // placeholder_id -> media_id

  constructor() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Using demo cloud.');
      this.cloudinary = new Cloudinary({ cloud: { cloudName: 'demo' } });
    } else {
       this.cloudinary = new Cloudinary({ cloud: { cloudName } });
    }
    // TODO: Consider pre-loading mappings or assets if needed
  }

  // Resolves placeholder ID to media asset
  // Uses cache first, then database
  getMediaByPlaceholderId = cache(async (placeholderId: string): Promise<MediaAsset | null> => {
    // 1. Check mapping cache
    if (this.mappingCache.has(placeholderId)) {
        const mediaId = this.mappingCache.get(placeholderId);
        if (mediaId === null) return null; // Explicitly not found
        // 2. Check asset cache
        if (this.assetCache.has(mediaId!)) {
            return this.assetCache.get(mediaId!) || null;
        }
    }

    // 3. Fetch mapping from DB if not cached
    let mediaId = this.mappingCache.get(placeholderId);
    if (mediaId === undefined) {
        const { data: mappingData, error: mappingError } = await this.supabase
            .from('media_mappings')
            .select('media_id')
            .eq('placeholder_id', placeholderId)
            .single();

        if (mappingError || !mappingData) {
            if (mappingError && mappingError.code !== 'PGRST116') { // Ignore 'Row not found' errors
               console.error(`Error fetching mapping for placeholder ${placeholderId}:`, mappingError);
            }
            this.mappingCache.set(placeholderId, null); // Cache not found
            return null;
        }
        mediaId = mappingData.media_id;
        this.mappingCache.set(placeholderId, mediaId);
    }

    if (!mediaId) return null;

    // 4. Fetch asset from DB if not cached
    if (!this.assetCache.has(mediaId)) {
        const { data: assetData, error: assetError } = await this.supabase
            .from('media_assets')
            .select('*')
            .eq('id', mediaId)
            .single();

        if (assetError || !assetData) {
            if (assetError && assetError.code !== 'PGRST116') {
                console.error(`Error fetching asset ${mediaId} for placeholder ${placeholderId}:`, assetError);
            }
            this.assetCache.set(mediaId, null); // Cache not found
            // Also invalidate mapping cache in case the asset was deleted
            this.mappingCache.delete(placeholderId);
            return null;
        }
        this.assetCache.set(mediaId, assetData as MediaAsset);
    }

    // Set timeout to clear cache after 5 minutes (adjust as needed)
    setTimeout(() => {
        this.mappingCache.delete(placeholderId);
        if (mediaId) this.assetCache.delete(mediaId);
    }, 5 * 60 * 1000);


    return this.assetCache.get(mediaId) || null;
  });

  // Generates an optimized Cloudinary URL
  getMediaUrl(asset: MediaAsset | null, options: MediaOptions = {}): string | null {
    if (!asset || !asset.cloudinary_id) {
        // Return a default placeholder or null if asset is not found
        return '/placeholder.svg'; // Or configure a proper placeholder
    }

    const resourceType = asset.type === 'video' ? 'video' : 'image';
    const cldAsset = this.cloudinary[resourceType](asset.cloudinary_id);

    // Apply transformations
    if (options.width || options.height) {
        cldAsset.resize(fill(options.width, options.height).gravity(autoGravity()));
    }
    if (options.format) {
        cldAsset.format(options.format === 'auto' ? auto() : options.format);
    } else {
        cldAsset.format(auto()); // Default to auto format
    }
    if (options.quality) {
        cldAsset.quality(options.quality === 'auto' ? qAuto() : options.quality);
    } else {
        cldAsset.quality(qAuto()); // Default to auto quality
    }

    // Add other transformations based on MediaOptions as needed

    return cldAsset.toURL();
  }

  // Update media mapping
  async updateMediaMapping(placeholderId: string, cloudinaryId: string, metadata?: Record<string, any>): Promise<MediaMapping | null> {
    // 1. Find or create the MediaAsset
    let { data: existingAsset, error: assetFindError } = await this.supabase
      .from('media_assets')
      .select('*')
      .eq('cloudinary_id', cloudinaryId)
      .maybeSingle();

    let mediaId: string;

    if (assetFindError) {
      console.error('Error finding media asset:', assetFindError);
      return null;
    }

    if (existingAsset) {
      mediaId = existingAsset.id;
      // Optionally update asset metadata if provided
      if (metadata) {
        const { error: updateError } = await this.supabase
          .from('media_assets')
          .update({ metadata, updated_at: new Date().toISOString() })
          .eq('id', mediaId);
        if (updateError) console.error('Error updating asset metadata:', updateError);
        else this.assetCache.set(mediaId, { ...existingAsset, metadata }); // Update cache
      }
    } else {
      // Fetch metadata from Cloudinary if needed or use provided
      // For simplicity, we assume essential details like type, w/h are in `metadata` or handled elsewhere
      const newAsset: Omit<MediaAsset, 'id' | 'created_at' | 'updated_at'> = {
        cloudinary_id: cloudinaryId,
        type: metadata?.resource_type || 'image', // Infer type or default
        metadata: metadata || null,
        width: metadata?.width || null,
        height: metadata?.height || null,
        format: metadata?.format || null,
        title: metadata?.title || null,
        alt_text: metadata?.alt || null,
      };
      const { data: insertedAsset, error: insertAssetError } = await this.supabase
        .from('media_assets')
        .insert(newAsset)
        .select()
        .single();

      if (insertAssetError || !insertedAsset) {
        console.error('Error creating new media asset:', insertAssetError);
        return null;
      }
      mediaId = insertedAsset.id;
      this.assetCache.set(mediaId, insertedAsset as MediaAsset); // Add to cache
    }

    // 2. Upsert the MediaMapping
    const { data: mapping, error: upsertError } = await this.supabase
        .from('media_mappings')
        .upsert({ placeholder_id: placeholderId, media_id: mediaId }, { onConflict: 'placeholder_id' })
        .select()
        .single();

    if (upsertError || !mapping) {
        console.error('Error upserting media mapping:', upsertError);
        return null;
    }

    // Update mapping cache
    this.mappingCache.set(placeholderId, mediaId);
     // Clear cache timeout if exists
    clearTimeout(this.assetCacheTimeoutId);
    this.assetCacheTimeoutId = setTimeout(() => {
      this.mappingCache.delete(placeholderId);
      this.assetCache.delete(mediaId);
    }, 5 * 60 * 1000); // 5 minutes

    return mapping as MediaMapping;
  }

  // Delete media mapping
  async deleteMediaMapping(placeholderId: string): Promise<boolean> {
      const { error } = await this.supabase
          .from('media_mappings')
          .delete()
          .eq('placeholder_id', placeholderId);

      if (error) {
          console.error(`Error deleting mapping for placeholder ${placeholderId}:`, error);
          return false;
      }

      // Clear caches
      this.mappingCache.delete(placeholderId);
      // Note: We don't delete the asset itself, just the mapping.
      // You might want to implement asset cleanup logic separately.

      return true;
  }

  // Upload new media and map it
  // This is a basic example; needs robust error handling, progress, etc.
  // Assumes Cloudinary upload happens client-side or via a separate serverless function
  // This service method primarily handles creating the DB records after upload.
  async handleNewUpload(placeholderId: string, uploadResult: any): Promise<MediaMapping | null> {
    // `uploadResult` should contain Cloudinary response (public_id, resource_type, etc.)
     if (!uploadResult || !uploadResult.public_id) {
       console.error('Invalid upload result provided');
       return null;
     }

     const cloudinaryId = uploadResult.public_id;
     const metadata = {
        resource_type: uploadResult.resource_type || 'image',
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        // Extract title/alt from context if available, or use defaults
        title: uploadResult.context?.custom?.title,
        alt: uploadResult.context?.custom?.alt,
        // Add any other relevant metadata from the Cloudinary response
     };

     return this.updateMediaMapping(placeholderId, cloudinaryId, metadata);
  }

  // Fetch multiple assets efficiently
  async getMultipleMediaByPlaceholderIds(placeholderIds: string[]): Promise<Record<string, MediaAsset | null>> {
    const results: Record<string, MediaAsset | null> = {};
    const idsToFetch: string[] = [];

    // Check cache first
    for (const pid of placeholderIds) {
      if (this.mappingCache.has(pid)) {
        const mid = this.mappingCache.get(pid);
        if (mid && this.assetCache.has(mid)) {
          results[pid] = this.assetCache.get(mid) || null;
        } else if (mid === null) {
          results[pid] = null;
        } else {
          idsToFetch.push(pid);
        }
      } else {
        idsToFetch.push(pid);
      }
    }

    if (idsToFetch.length === 0) return results;

    // Fetch remaining mappings and assets
    const { data, error } = await this.supabase
      .from('media_mappings')
      .select(`
        placeholder_id,
        media_assets (*)
      `)
      .in('placeholder_id', idsToFetch);

    if (error) {
      console.error('Error fetching multiple media assets:', error);
      // Fill missing ones with null
       idsToFetch.forEach(pid => { if(!(pid in results)) results[pid] = null; });
       return results;
    }

    // Process fetched data and update caches
    const fetchedMap = new Map(data?.map(item => [item.placeholder_id, item.media_assets as MediaAsset | null]) || []);

    idsToFetch.forEach(pid => {
      const asset = fetchedMap.get(pid);
      results[pid] = asset || null;
      const mediaId = asset?.id || null;
      this.mappingCache.set(pid, mediaId);
      if (mediaId && asset) {
        this.assetCache.set(mediaId, asset);
      }
      // Set cache timeouts (consider a more efficient way for bulk operations)
      setTimeout(() => {
        this.mappingCache.delete(pid);
        if (mediaId) this.assetCache.delete(mediaId);
      }, 5 * 60 * 1000);
    });

    return results;
  }

  // Fetch all media assets (use with caution, potentially large payload)
  async getAllMediaAssets(): Promise<MediaAsset[]> {
    const { data, error } = await this.supabase
      .from('media_assets')
      .select('*');

    if (error) {
      console.error('Error fetching all media assets:', error);
      return [];
    }
    return (data || []) as MediaAsset[];
  }

    // Fetch all media mappings
  async getAllMediaMappings(): Promise<MediaMapping[]> {
    const { data, error } = await this.supabase
      .from('media_mappings')
      .select('*');

    if (error) {
      console.error('Error fetching all media mappings:', error);
      return [];
    }
    return (data || []) as MediaMapping[];
  }

  // Private helper to manage cache timeouts
  private assetCacheTimeoutId: NodeJS.Timeout | null = null;

}

// Export singleton instance
export const mediaService = new MediaService();