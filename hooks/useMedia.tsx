'use client';

import { useState, useEffect } from 'react';
import { getCloudinaryUrl, getCloudinaryVideoUrl, getCloudinaryImageSrcSet } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase';

// Types for media assets
export interface MediaAsset {
  id: string;
  publicId: string;
  type: 'image' | 'video';
  title?: string;
  altText?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface MediaHookResult {
  url: string | null;
  publicId: string | null;
  srcSet?: string;
  isLoading: boolean;
  error: string | null;
  isVideo: boolean;
}

/**
 * Helper function to detect if an asset is a video
 */
export function isVideoAsset(publicId: string, type?: string): boolean {
  // If we have the explicit type, use it
  if (type === 'video') return true;
  
  // Otherwise check for common video formats in the public ID
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  const hasVideoExtension = videoExtensions.some(ext => publicId.toLowerCase().includes(ext));
  
  // Check for Cloudinary resource_type indicators
  const isVideoResource = publicId.includes('/video/') || publicId.includes('resource_type=video');
  
  return hasVideoExtension || isVideoResource;
}

/**
 * Hook to fetch and use media assets
 * 
 * @param placeholderId The ID of the media placeholder (legacy support) or direct public ID
 * @param options Optional Cloudinary transformation options
 * @returns Object with url, publicId, srcSet, loading state, and error
 */
export function useMediaAsset(
  placeholderId: string,
  options: Record<string, any> = {}
): MediaHookResult {
  const [result, setResult] = useState<MediaHookResult>({
    url: null,
    publicId: null,
    isLoading: true,
    error: null,
    isVideo: false
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchMediaAsset() {
      try {
        // Check if the placeholderId is actually a direct Cloudinary public ID
        // (This is for supporting direct usage without the placeholder system)
        if (placeholderId.includes('/')) {
          const isVideo = isVideoAsset(placeholderId);
          const url = isVideo ? 
            getCloudinaryVideoUrl(placeholderId, options) : 
            getCloudinaryUrl(placeholderId, options);
            
          const srcSet = (!isVideo && options.responsive !== false) ? 
            getCloudinaryImageSrcSet(placeholderId, options) : 
            undefined;
            
          if (isMounted) {
            setResult({
              url,
              publicId: placeholderId,
              srcSet,
              isLoading: false,
              error: null,
              isVideo
            });
          }
          return;
        }
        
        // Otherwise look up in the media_assets table
        try {
          const supabase = createClient();
          
          // First try looking up by legacy_placeholder_id in metadata
          const { data: metadataData, error: metadataError } = await supabase
            .from('media_assets')
            .select('public_id, type, metadata')
            .filter('metadata->legacy_placeholder_id', 'eq', placeholderId)
            .maybeSingle();
            
          if (!metadataError && metadataData) {
            const publicId = metadataData.public_id;
            const isVideo = metadataData.type === 'video' || isVideoAsset(publicId, metadataData.type);
            
            let url;
            let srcSet;
            
            if (isVideo) {
              url = getCloudinaryVideoUrl(publicId, options);
              // Video formats don't use srcSet the same way
            } else {
              url = getCloudinaryUrl(publicId, options);
              // Generate srcSet for responsive images if needed
              srcSet = options.responsive !== false ? 
                getCloudinaryImageSrcSet(publicId, options) : 
                undefined;
            }
            
            if (isMounted) {
              setResult({
                url,
                publicId,
                srcSet,
                isLoading: false,
                error: null,
                isVideo
              });
            }
            return;
          }
          
          // If not found by legacy_placeholder_id, check if the placeholder ID itself is a valid public_id in the table
          const { data, error } = await supabase
            .from('media_assets')
            .select('public_id, type')
            .eq('public_id', placeholderId)
            .maybeSingle();

          if (!error && data && data.public_id) {
            const publicId = data.public_id;
            const isVideo = data.type === 'video' || isVideoAsset(publicId, data.type);
            
            let url;
            let srcSet;
            
            if (isVideo) {
              url = getCloudinaryVideoUrl(publicId, options);
            } else {
              url = getCloudinaryUrl(publicId, options);
              srcSet = options.responsive !== false ? 
                getCloudinaryImageSrcSet(publicId, options) : 
                undefined;
            }
            
            if (isMounted) {
              setResult({
                url,
                publicId,
                srcSet,
                isLoading: false,
                error: null,
                isVideo
              });
            }
            return;
          }
        } catch (supabaseError) {
          // If there's an error with Supabase, log it and continue to the fallback
          console.warn('Error accessing Supabase:', supabaseError);
        }

        // Fallback to the media map API
        const response = await fetch('/api/site/media-assets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch media assets: ${response.statusText}`);
        }
        
        const mediaAssets = await response.json();
        
        // Check if it's a legacy placeholder ID
        if (mediaAssets[placeholderId] && mediaAssets[placeholderId].cloudinaryPublicId) {
          const asset = mediaAssets[placeholderId];
          const publicId = asset.cloudinaryPublicId;
          const isVideo = isVideoAsset(publicId);
                         
          let url;
          let srcSet;
          
          if (isVideo) {
            url = getCloudinaryVideoUrl(publicId, options);
          } else {
            url = getCloudinaryUrl(publicId, options);
            srcSet = options.responsive !== false ? 
              getCloudinaryImageSrcSet(publicId, options) : 
              undefined;
          }
            
          if (isMounted) {
            setResult({
              url,
              publicId,
              srcSet,
              isLoading: false,
              error: null,
              isVideo
            });
          }
        } else {
          if (isMounted) {
            setResult({
              url: null,
              publicId: null,
              isLoading: false,
              error: `Media asset not found: ${placeholderId}`,
              isVideo: false
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setResult({
            url: null,
            publicId: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching media asset',
            isVideo: false
          });
        }
      }
    }

    fetchMediaAsset();

    return () => {
      isMounted = false;
    };
  }, [placeholderId, JSON.stringify(options)]);

  return result;
}

/**
 * Get a static media asset URL without React hooks
 * Useful for server components or non-React contexts
 * 
 * @param idOrPublicId The ID of the placeholder or a direct Cloudinary public ID
 * @param options Optional Cloudinary transformation options
 * @returns Promise resolving to the media URL or null
 */
export async function getMediaAsset(
  idOrPublicId: string,
  options: Record<string, any> = {}
): Promise<string | null> {
  try {
    // Check if idOrPublicId looks like a Cloudinary public ID (contains slashes)
    if (idOrPublicId.includes('/')) {
      // It's already a public ID, simply return the URL
      return getCloudinaryUrl(idOrPublicId, options);
    }
    
    // Otherwise, try to get the asset from Supabase
    try {
      const supabase = createClient();
      
      // First try looking up by legacy_placeholder_id in metadata
      const { data: metadataData, error: metadataError } = await supabase
        .from('media_assets')
        .select('public_id')
        .filter('metadata->legacy_placeholder_id', 'eq', idOrPublicId)
        .maybeSingle();
        
      if (!metadataError && metadataData) {
        return getCloudinaryUrl(metadataData.public_id, options);
      }
      
      // If not found by legacy_placeholder_id, check if it's a direct public_id
      const { data, error } = await supabase
        .from('media_assets')
        .select('public_id')
        .eq('public_id', idOrPublicId)
        .maybeSingle();

      if (!error && data) {
        return getCloudinaryUrl(data.public_id, options);
      }
    } catch (supabaseError) {
      // If there's an error with Supabase, log it and continue to the fallback
      console.warn('Error accessing Supabase:', supabaseError);
    }

    // Fallback to the media map API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/site/media-assets`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media assets: ${response.statusText}`);
    }
    
    const mediaAssets = await response.json();
    const asset = mediaAssets[idOrPublicId];
    
    if (asset && asset.cloudinaryPublicId) {
      return getCloudinaryUrl(asset.cloudinaryPublicId, options);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting media asset:', error);
    return null;
  }
} 