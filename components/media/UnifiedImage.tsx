'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { mediaService, MediaOptions } from '@/lib/services/media-service';
import { Skeleton } from "@/components/ui/skeleton";

interface UnifiedImageProps extends Omit<ImageProps, 'src'> {
  placeholderId: string;
  options?: MediaOptions;
  fallbackSrc?: string;
  showLoading?: boolean;
}

/**
 * UnifiedImage component - A wrapper around Next.js Image component
 * 
 * Features:
 * - Automatically resolves placeholder IDs to Cloudinary URLs
 * - Handles loading and error states
 * - Supports responsive images
 * - Provides fallback for missing images
 * 
 * @example
 * <UnifiedImage
 *   placeholderId="home-hero"
 *   alt="Home hero image"
 *   width={1200}
 *   height={600}
 *   options={{ quality: 90 }}
 *   priority
 * />
 */
export default function UnifiedImage({
  placeholderId,
  options = {},
  fallbackSrc = '/placeholder-image.jpg',
  showLoading = true,
  alt = '',
  width,
  height,
  sizes = '100vw',
  ...props
}: UnifiedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<any>(null);
  
  // Fetch the media asset when the component mounts
  React.useEffect(() => {
    let isMounted = true;
    
    async function loadAsset() {
      try {
        setLoading(true);
        const result = await mediaService.getMediaByPlaceholderId(placeholderId);
        
        if (isMounted) {
          setAsset(result);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error loading image for ${placeholderId}:`, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }
    
    loadAsset();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId]);
  
  // Handle loading state
  if (loading && showLoading) {
    return (
      <Skeleton 
        className="rounded overflow-hidden" 
        style={{ width: width || '100%', height: height || 'auto', aspectRatio: width && height ? width / height : undefined }}
      />
    );
  }
  
  // Handle error state or missing asset
  if (error || !asset) {
    if (!fallbackSrc) {
      return null;
    }
    
    return (
      <Image 
        src={fallbackSrc}
        alt={alt}
        width={typeof width === 'number' ? width : 800}
        height={typeof height === 'number' ? height : 600}
        sizes={sizes}
        {...props}
      />
    );
  }
  
  // Get the optimized URL with transformations
  const src = mediaService.getMediaUrl(asset, options);
  
  // Return the Next.js Image with the resolved src
  return (
    <Image
      src={src}
      alt={alt || asset.alt_text || placeholderId}
      width={typeof width === 'number' ? width : asset.width || 800}
      height={typeof height === 'number' ? height : asset.height || 600}
      sizes={sizes}
      onError={() => setError(true)}
      {...props}
    />
  );
}
