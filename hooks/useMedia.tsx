'use client';

import { useState, useEffect } from 'react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

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
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and use media assets
 * 
 * @param placeholderId The ID of the media placeholder
 * @param options Optional Cloudinary transformation options
 * @returns Object with url, publicId, loading state, and error
 */
export function useMediaAsset(
  placeholderId: string,
  options: Record<string, any> = {}
): MediaHookResult {
  const [result, setResult] = useState<MediaHookResult>({
    url: null,
    publicId: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchMediaAsset() {
      try {
        // First try to get the asset from Supabase if available
        if (supabase) {
          const { data, error } = await supabase
            .from('media_assets')
            .select('cloudinary_id')
            .eq('placeholder_id', placeholderId)
            .single();

          if (error) {
            // If the table doesn't exist or there's another error, fall back to the media map
            console.warn(`Supabase error fetching media asset: ${error.message}`);
          } else if (data && data.cloudinary_id) {
            // We found the asset in Supabase
            const publicId = data.cloudinary_id;
            if (isMounted) {
              setResult({
                url: getCloudinaryUrl(publicId, options),
                publicId,
                isLoading: false,
                error: null
              });
            }
            return;
          }
        }

        // Fallback to the media map API
        const response = await fetch('/api/site/media-assets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch media assets: ${response.statusText}`);
        }
        
        const mediaAssets = await response.json();
        const asset = mediaAssets[placeholderId];
        
        if (asset && asset.cloudinaryPublicId) {
          if (isMounted) {
            setResult({
              url: getCloudinaryUrl(asset.cloudinaryPublicId, options),
              publicId: asset.cloudinaryPublicId,
              isLoading: false,
              error: null
            });
          }
        } else {
          if (isMounted) {
            setResult({
              url: null,
              publicId: null,
              isLoading: false,
              error: `Media asset not found for placeholder: ${placeholderId}`
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setResult({
            url: null,
            publicId: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error fetching media asset'
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
    if (supabase) {
      const { data, error } = await supabase
        .from('media_assets')
        .select('cloudinary_id')
        .eq('placeholder_id', placeholderId)
        .single();

      if (!error && data && data.cloudinary_id) {
        return getCloudinaryUrl(data.cloudinary_id, options);
      }
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