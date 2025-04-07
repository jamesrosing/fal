// components/media/UnifiedImage.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { mediaService, MediaAsset, MediaOptions } from '@/lib/services/media-service';

// Combine NextImageProps with our specific props
interface UnifiedImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  placeholderId: string;
  alt?: string; // Making alt optional initially, will use asset's alt if available
  fallbackSrc?: string;
  showLoading?: boolean;
  mediaOptions?: MediaOptions; // For applying transformations
}

export default function UnifiedImage({
  placeholderId,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  className = '',
  fallbackSrc = '/placeholder.svg', // Use a generic SVG placeholder
  showLoading = true,
  mediaOptions = {},
  ...rest // Pass through other NextImage props like style, quality, unoptimized, etc.
}: UnifiedImageProps) {

  const [asset, setAsset] = useState<MediaAsset | null | undefined>(undefined); // undefined: loading, null: error/not found
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAsset() {
      try {
        const fetchedAsset = await mediaService.getMediaByPlaceholderId(placeholderId);
        if (isMounted) {
          if (fetchedAsset && fetchedAsset.type === 'image') {
            setAsset(fetchedAsset);
            const url = mediaService.getMediaUrl(fetchedAsset, mediaOptions);
            setImageUrl(url);
          } else {
             if (fetchedAsset && fetchedAsset.type !== 'image') {
                console.warn(`Asset for placeholderId '${placeholderId}' is not an image.`);
             }
             setAsset(null); // Treat non-image or null as not found
             setImageUrl(fallbackSrc);
          }
        }
      } catch (err) {
        console.error(`Error loading image for placeholderId '${placeholderId}':`, err);
        if (isMounted) {
          setAsset(null); // Error state
          setImageUrl(fallbackSrc);
        }
      }
    }

    setAsset(undefined); // Reset to loading state on prop change
    setImageUrl(null);
    loadAsset();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderId, JSON.stringify(mediaOptions), fallbackSrc]); // Reload if placeholderId or options change

  const effectiveAlt = alt ?? asset?.alt_text ?? `Image for ${placeholderId}`; // Provide a meaningful default alt
  const isLoading = asset === undefined;
  const hasError = asset === null;

  // Determine final width and height for layout
  const finalWidth = fill ? undefined : (width ?? asset?.width ?? undefined);
  const finalHeight = fill ? undefined : (height ?? asset?.height ?? undefined);

  if (isLoading && showLoading) {
    // Ensure Skeleton matches the expected aspect ratio if possible
    let skeletonHeight: string | number = 'auto';
    if (finalHeight) {
      skeletonHeight = `${finalHeight}px`;
    } else if (finalWidth && typeof finalWidth === 'number') {
      // Default aspect ratio if height is unknown (e.g., 16:9)
      skeletonHeight = `${Math.round(finalWidth * 9 / 16)}px`;
    }

    return (
      <Skeleton
        className={className}
        style={{
          width: finalWidth ? `${finalWidth}px` : '100%',
          height: skeletonHeight,
          aspectRatio: (finalWidth && finalHeight) ? `${finalWidth}/${finalHeight}` : undefined,
          ...((rest.style as React.CSSProperties) ?? {}),
        }}
      />
    );
  }

  // Use NextImage for rendering, leveraging its optimization features
  // Src will be the Cloudinary URL or fallback
  return (
    <NextImage
      src={imageUrl || fallbackSrc} // Use resolved URL or fallback
      alt={effectiveAlt}
      width={finalWidth} // Pass calculated or provided width
      height={finalHeight} // Pass calculated or provided height
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
          // Handle image loading errors (e.g., network issue, broken Cloudinary link)
          if (imageUrl !== fallbackSrc) {
            console.warn(`Failed to load image: ${imageUrl}. Falling back to ${fallbackSrc}`);
            setImageUrl(fallbackSrc);
          }
      }}
      {...rest} // Spread remaining props
    />
  );
}