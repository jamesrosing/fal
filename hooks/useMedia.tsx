'use client';

import { useState, useEffect } from 'react';
import { getCloudinaryUrl, getCloudinaryVideoUrl, getCloudinaryImageSrcSet } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase';

// Types for media assets
export interface MediaAsset {
  placeholderId: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
  uploadedBy?: string;
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
export function isVideoAsset(publicId: string): boolean {
  // Check for common video formats in the public ID or metadata
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  const hasVideoExtension = videoExtensions.some(ext => publicId.toLowerCase().includes(ext));
  
  // Check for Cloudinary resource_type indicators
  const isVideoResource = publicId.includes('/video/') || publicId.includes('resource_type=video');
  
  return hasVideoExtension || isVideoResource;
}

/**
 * Hook to fetch and use media assets
 * 
 * @param placeholderId The ID of the media placeholder
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
        // First try to get the asset from Supabase if available
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('media_assets')
            .select('cloudinary_id, metadata')
            .eq('placeholder_id', placeholderId)
            .single();

          if (error) {
            // If the table doesn't exist or there's another error, fall back to the media map
            console.warn(`Supabase error fetching media asset: ${error.message}`);
          } else if (data && data.cloudinary_id) {
            // We found the asset in Supabase
            const publicId = data.cloudinary_id;
            const isVideo = isVideoAsset(publicId) || 
                           (data.metadata && data.metadata.resource_type === 'video');
            
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
        const asset = mediaAssets[placeholderId];
        
        if (asset && asset.cloudinaryPublicId) {
          const isVideo = isVideoAsset(asset.cloudinaryPublicId) || 
                         (asset.metadata && asset.metadata.resource_type === 'video');
                         
          let url;
          let srcSet;
          
          if (isVideo) {
            url = getCloudinaryVideoUrl(asset.cloudinaryPublicId, options);
            // Video formats don't use srcSet the same way
          } else {
            url = getCloudinaryUrl(asset.cloudinaryPublicId, options);
            // Generate srcSet for responsive images if needed
            srcSet = options.responsive !== false ? 
              getCloudinaryImageSrcSet(asset.cloudinaryPublicId, options) : 
              undefined;
          }
            
          if (isMounted) {
            setResult({
              url,
              publicId: asset.cloudinaryPublicId,
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
              error: `Media asset not found for placeholder: ${placeholderId}`,
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
 * @param placeholderId The ID of the media placeholder
 * @param options Optional Cloudinary transformation options
 * @returns Promise resolving to the media URL or null
 */
export async function getMediaAsset(
  placeholderId: string,
  options: Record<string, any> = {}
): Promise<string | null> {
  try {
    // First try to get the asset from Supabase if available
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('media_assets')
        .select('cloudinary_id')
        .eq('placeholder_id', placeholderId)
        .single();

      if (!error && data && data.cloudinary_id) {
        return getCloudinaryUrl(data.cloudinary_id, options);
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
    const asset = mediaAssets[placeholderId];
    
    if (asset && asset.cloudinaryPublicId) {
      return getCloudinaryUrl(asset.cloudinaryPublicId, options);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting media asset:', error);
    return null;
  }
} 