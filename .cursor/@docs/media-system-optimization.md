# Media Management System Optimization

## Current Architecture

The current media management system appears to use a complex approach involving:

1. **Media Placeholders**: Predefined locations in the site where media can be displayed
2. **Cloudinary Integration**: For storing and transforming images and videos
3. **Supabase Tables**: For storing mappings between placeholders and actual media assets
4. **Multiple API Routes**: For handling different aspects of media management

This architecture creates several challenges, including maintenance complexity, performance issues, and duplicated code.

## Proposed Optimizations

### 1. Unified Media Service

Create a centralized media service that handles all media operations:

```typescript
// lib/services/media-service.ts
import { createClient } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';
import { CldUploadApiResponse } from 'next-cloudinary';
import { cache } from 'react';

// Types
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

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  transformation?: Record<string, any>;
  eager?: Record<string, any>[];
}

export class MediaService {
  // Initialize with configuration
  constructor(private config = {}) {
    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  
  // Get media by placeholder ID with caching
  getMediaByPlaceholderId = cache(async (placeholderId: string): Promise<MediaAsset | null> => {
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
  
  // Get all media assets
  async getAllMedia(): Promise<MediaAsset[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching media assets:', error);
      return [];
    }
    
    return data as MediaAsset[];
  }
  
  // Upload media to Cloudinary and register in Supabase
  async uploadMedia(
    file: File | Buffer | string, 
    options: UploadOptions = {}
  ): Promise<MediaAsset | null> {
    try {
      // Upload to Cloudinary
      const uploadResponse = await this.uploadToCloudinary(file, options);
      
      if (!uploadResponse) {
        return null;
      }
      
      // Create asset in Supabase
      const mediaAsset = await this.createMediaAssetRecord(uploadResponse);
      return mediaAsset;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }
  
  // Upload to Cloudinary
  private async uploadToCloudinary(
    file: File | Buffer | string,
    options: UploadOptions = {}
  ): Promise<CldUploadApiResponse | null> {
    try {
      // Configure upload options
      const uploadOptions = {
        folder: options.folder || 'media',
        tags: options.tags || [],
        resource_type: 'auto',
        ...options
      };
      
      // Perform upload
      return await new Promise((resolve, reject) => {
        const uploadCallback = (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        };
        
        if (typeof file === 'string' && file.startsWith('http')) {
          // Upload from URL
          cloudinary.uploader.upload(file, uploadOptions, uploadCallback);
        } else if (typeof file === 'string') {
          // Upload from base64 or file path
          cloudinary.uploader.upload(file, uploadOptions, uploadCallback);
        } else if (file instanceof Buffer) {
          // Upload from buffer
          cloudinary.uploader.upload_stream(uploadOptions, uploadCallback).end(file);
        } else {
          // Upload from File object (browser)
          const reader = new FileReader();
          reader.onload = () => {
            cloudinary.uploader.upload(reader.result as string, uploadOptions, uploadCallback);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file as File);
        }
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  }
  
  // Create media asset record in Supabase
  private async createMediaAssetRecord(
    uploadResponse: CldUploadApiResponse
  ): Promise<MediaAsset | null> {
    const supabase = createClient();
    
    const mediaAsset = {
      cloudinary_id: uploadResponse.public_id,
      type: uploadResponse.resource_type as 'image' | 'video',
      title: uploadResponse.original_filename,
      alt_text: uploadResponse.original_filename,
      metadata: {
        original_filename: uploadResponse.original_filename,
        format: uploadResponse.format,
        resource_type: uploadResponse.resource_type,
        secure_url: uploadResponse.secure_url,
        created_at: uploadResponse.created_at,
        bytes: uploadResponse.bytes,
        folder: uploadResponse.folder,
        tags: uploadResponse.tags,
      },
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
    };
    
    const { data, error } = await supabase
      .from('media_assets')
      .insert(mediaAsset)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating media asset record:', error);
      return null;
    }
    
    return data as MediaAsset;
  }
  
  // Map media to placeholder
  async mapMediaToPlaceholder(placeholderId: string, mediaId: string): Promise<boolean> {
    const supabase = createClient();
    
    // Check if mapping already exists
    const { data: existingMapping } = await supabase
      .from('media_mappings')
      .select('id')
      .eq('placeholder_id', placeholderId)
      .single();
      
    if (existingMapping) {
      // Update existing mapping
      const { error } = await supabase
        .from('media_mappings')
        .update({ media_id: mediaId, updated_at: new Date().toISOString() })
        .eq('id', existingMapping.id);
        
      if (error) {
        console.error(`Error updating mapping for placeholder ${placeholderId}:`, error);
        return false;
      }
    } else {
      // Create new mapping
      const { error } = await supabase
        .from('media_mappings')
        .insert({ placeholder_id: placeholderId, media_id: mediaId });
        
      if (error) {
        console.error(`Error creating mapping for placeholder ${placeholderId}:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  // Delete media
  async deleteMedia(mediaId: string): Promise<boolean> {
    const supabase = createClient();
    
    // Get the media asset
    const { data: mediaAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('cloudinary_id')
      .eq('id', mediaId)
      .single();
      
    if (fetchError || !mediaAsset) {
      console.error(`Error fetching media asset ${mediaId}:`, fetchError);
      return false;
    }
    
    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(mediaAsset.cloudinary_id);
    } catch (error) {
      console.error(`Error deleting from Cloudinary ${mediaAsset.cloudinary_id}:`, error);
      // Continue with deletion from database even if Cloudinary fails
    }
    
    // Delete mappings
    const { error: mappingError } = await supabase
      .from('media_mappings')
      .delete()
      .eq('media_id', mediaId);
      
    if (mappingError) {
      console.error(`Error deleting mappings for media ${mediaId}:`, mappingError);
      // Continue with deletion of the asset even if mapping deletion fails
    }
    
    // Delete asset record
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', mediaId);
      
    if (deleteError) {
      console.error(`Error deleting media asset ${mediaId}:`, deleteError);
      return false;
    }
    
    return true;
  }
  
  // Generate optimized variants
  async generateResponsiveVariants(mediaId: string): Promise<boolean> {
    const supabase = createClient();
    
    // Get the media asset
    const { data: mediaAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('cloudinary_id, type')
      .eq('id', mediaId)
      .single();
      
    if (fetchError || !mediaAsset) {
      console.error(`Error fetching media asset ${mediaId}:`, fetchError);
      return false;
    }
    
    // Only process images
    if (mediaAsset.type !== 'image') {
      return false;
    }
    
    try {
      // Generate eager transformations
      const variants = [
        { width: 640, height: 480, crop: 'fill', quality: 'auto' },
        { width: 1024, height: 768, crop: 'fill', quality: 'auto' },
        { width: 1920, height: 1080, crop: 'fill', quality: 'auto' },
        { width: 320, height: 240, crop: 'fill', quality: 'auto' }, // Mobile thumbnail
      ];
      
      const result = await cloudinary.uploader.explicit(mediaAsset.cloudinary_id, {
        type: 'upload',
        eager: variants,
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
      });
      
      // Update metadata in Supabase
      const { error: updateError } = await supabase
        .from('media_assets')
        .update({
          metadata: {
            ...mediaAsset.metadata,
            responsive_variants: result.eager.map(variant => ({
              url: variant.secure_url,
              width: variant.width,
              height: variant.height,
              transformation: variant.transformation
            }))
          }
        })
        .eq('id', mediaId);
        
      if (updateError) {
        console.error(`Error updating media asset ${mediaId} with variants:`, updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error generating variants for ${mediaAsset.cloudinary_id}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const mediaService = new MediaService();

// UI Components

// components/ui/media-image.tsx
import React from 'react';
import { CldImage } from 'next-cloudinary';
import { mediaService, MediaAsset } from '@/lib/services/media-service';

interface MediaImageProps {
  placeholderId: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackSrc?: string;
}

export async function MediaImage({
  placeholderId,
  width = 800,
  height = 600,
  alt = '',
  className = '',
  priority = false,
  sizes = '100vw',
  fallbackSrc
}: MediaImageProps) {
  // Fetch media for this placeholder
  const media = await mediaService.getMediaByPlaceholderId(placeholderId);
  
  if (!media || media.type !== 'image') {
    // Use fallback image if provided
    if (fallbackSrc) {
      return (
        <img 
          src={fallbackSrc} 
          alt={alt || 'Fallback image'} 
          width={width} 
          height={height} 
          className={className}
        />
      );
    }
    
    // Return empty space with correct dimensions
    return (
      <div 
        style={{ width, height }} 
        className={`bg-gray-200 ${className}`}
        aria-label={alt || 'Missing image'}
      />
    );
  }
  
  // Use Cloudinary Image
  return (
    <CldImage
      src={media.cloudinary_id}
      width={width}
      height={height}
      alt={alt || media.alt_text || 'Image'}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}

// components/ui/media-video.tsx
import React from 'react';
import { CldVideoPlayer } from 'next-cloudinary';
import { mediaService } from '@/lib/services/media-service';

interface MediaVideoProps {
  placeholderId: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export async function MediaVideo({
  placeholderId,
  width = 800,
  height = 450,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  className = '',
  fallbackSrc
}: MediaVideoProps) {
  // Fetch media for this placeholder
  const media = await mediaService.getMediaByPlaceholderId(placeholderId);
  
  if (!media || media.type !== 'video') {
    // Use fallback video if provided
    if (fallbackSrc) {
      return (
        <video
          src={fallbackSrc}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          className={className}
        />
      );
    }
    
    // Return empty space with correct dimensions
    return (
      <div 
        style={{ width, height }} 
        className={`bg-gray-200 ${className}`}
        aria-label="Missing video"
      />
    );
  }
  
  // Use Cloudinary Video
  return (
    <CldVideoPlayer
      id={`video-${placeholderId}`}
      width={width}
      height={height}
      src={media.cloudinary_id}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      className={className}
    />
  );
}
```

### 2. Automated Placeholder Discovery

Create a system to automatically discover and register placeholders from the codebase:

```typescript
// scripts/discover-placeholders.ts
import glob from 'glob';
import fs from 'fs';
import path from 'path';

async function discoverPlaceholders() {
  const placeholders = new Map();
  
  // Search for media components in the codebase
  const files = glob.sync('app/**/*.tsx');
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for MediaImage components
    const mediaImageMatches = content.matchAll(/<MediaImage[^>]*placeholderId=["']([^"']+)["'][^>]*>/g);
    for (const match of mediaImageMatches) {
      const placeholderId = match[1];
      const pagePath = file.replace('app/', '').replace('.tsx', '');
      
      placeholders.set(placeholderId, {
        id: placeholderId,
        type: 'image',
        page: pagePath,
        filePath: file,
      });
    }
    
    // Look for MediaVideo components
    const mediaVideoMatches = content.matchAll(/<MediaVideo[^>]*placeholderId=["']([^"']+)["'][^>]*>/g);
    for (const match of mediaVideoMatches) {
      const placeholderId = match[1];
      const pagePath = file.replace('app/', '').replace('.tsx', '');
      
      placeholders.set(placeholderId, {
        id: placeholderId,
        type: 'video',
        page: pagePath,
        filePath: file,
      });
    }
  }
  
  return Array.from(placeholders.values());
}

async function updatePlaceholdersInDatabase(placeholders) {
  const { createClient } = require('@/lib/supabase');
  const supabase = createClient();
  
  for (const placeholder of placeholders) {
    // Check if placeholder already exists
    const { data, error } = await supabase
      .from('application_structure')
      .select('id')
      .eq('placeholder_id', placeholder.id)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error(`Error checking placeholder ${placeholder.id}:`, error);
      continue;
    }
    
    if (!data) {
      // Create new placeholder
      const { error: insertError } = await supabase
        .from('application_structure')
        .insert({
          placeholder_id: placeholder.id,
          type: placeholder.type,
          page: placeholder.page,
        });
        
      if (insertError) {
        console.error(`Error creating placeholder ${placeholder.id}:`, insertError);
      } else {
        console.log(`Created new placeholder: ${placeholder.id}`);
      }
    }
  }
  
  console.log(`Processed ${placeholders.length} placeholders`);
}

async function main() {
  const placeholders = await discoverPlaceholders();
  console.log(`Discovered ${placeholders.length} placeholders`);
  
  await updatePlaceholdersInDatabase(placeholders);
}

main().catch(console.error);