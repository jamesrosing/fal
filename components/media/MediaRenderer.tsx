'use client';

import React, { useState, useEffect } from 'react';
import { mediaService, MediaAsset, MediaOptions } from '@/lib/services/media-service';
import UnifiedImage from './UnifiedImage';
import UnifiedVideo from './UnifiedVideo';
import { Skeleton } from "@/components/ui/skeleton";
import type { ImageProps as NextImageProps } from 'next/image';
import type { ComponentProps } from 'react';

// Extract VideoOptions type if UnifiedVideo exports it, otherwise redefine
type VideoOptions = ComponentProps<typeof UnifiedVideo>['options'];

// Define props clearly separating concerns
interface MediaRendererProps {
  placeholderId: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  showLoading?: boolean;

  // Image Props (subset of NextImageProps + mediaOptions)
  alt?: string;
  fill?: NextImageProps['fill'];
  priority?: NextImageProps['priority'];
  sizes?: NextImageProps['sizes'];
  quality?: NextImageProps['quality'];
  unoptimized?: NextImageProps['unoptimized'];
  style?: NextImageProps['style'];
  mediaOptions?: MediaOptions; // For UnifiedImage transformations
  // Note: NextImage's onLoad/onError are not directly exposed here
  // UnifiedImage handles its internal NextImage events

  // Video Props
  options?: VideoOptions; // Video playback options
  posterPlaceholderId?: string;
  onVideoLoad?: () => void; // Video-specific load event
  onVideoError?: () => void; // Video-specific error event
}

/**
 * MediaRenderer - A universal component for rendering any media type
 * 
 * Features:
 * - Automatically detects media type (image/video)
 * - Applies appropriate rendering component
 * - Unified props interface for both images and videos
 * 
 * @example
 * <MediaRenderer
 *   placeholderId="home-hero-media"
 *   alt="Home hero media"
 *   width={1200}
 *   height={600}
 *   priority
 * />
 */
export default function MediaRenderer({
  placeholderId,
  className,
  width,
  height,
  showLoading = true,
  // Image Props
  alt,
  fill,
  priority,
  sizes,
  quality,
  unoptimized,
  style,
  mediaOptions,
  // Video Props
  options: videoOptions,
  posterPlaceholderId,
  onVideoLoad,
  onVideoError,
}: MediaRendererProps) {

  const [asset, setAsset] = useState<MediaAsset | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    async function loadAsset() {
      setAsset(undefined);
      try {
        const fetchedAsset = await mediaService.getMediaByPlaceholderId(placeholderId);
        if (isMounted) {
          setAsset(fetchedAsset || null);
        }
      } catch (err) {
        console.error(`Error loading asset for MediaRenderer (placeholderId: ${placeholderId}):`, err);
        if (isMounted) {
          setAsset(null);
        }
      }
    }
    loadAsset();
    return () => { isMounted = false; };
  }, [placeholderId]);

  const isLoading = asset === undefined;
  const hasError = asset === null;

  const getSize = (value: number | string | undefined): string | undefined => {
      if (typeof value === 'number') return `${value}px`;
      return value;
  };
  const styleWidth = getSize(width);
  const styleHeight = getSize(height);

  // Combine incoming style with calculated dimensions if they are strings
  const combinedStyle = {
    ...(typeof width === 'string' ? { width } : {}),
    ...(typeof height === 'string' ? { height } : {}),
    ...style,
  };

  if (isLoading && showLoading) {
    const aspectRatio = (typeof width === 'number' && typeof height === 'number' && height > 0) ? `${width}/${height}` : '16/9';
    return (
      <Skeleton
        className={className}
        style={{ width: styleWidth ?? '100%', height: styleHeight, aspectRatio, ...style }}
      />
    );
  }

  if (hasError) {
    console.warn(`MediaRenderer could not load asset for placeholderId: ${placeholderId}`);
    return (
        <div className={`bg-destructive/10 text-destructive flex items-center justify-center ${className ?? ''}`}
             style={{ width: styleWidth ?? '100%', height: styleHeight ?? '100px', ...style }}>
            Media Error
        </div>
    );
  }

  if (asset?.type === 'video') {
    return (
      <UnifiedVideo
        placeholderId={placeholderId}
        options={videoOptions}
        posterPlaceholderId={posterPlaceholderId}
        onLoad={onVideoLoad}
        onError={onVideoError}
        width={width}
        height={height}
        className={className}
        style={style}
        showLoading={showLoading}
      />
    );
  }

  if (asset?.type === 'image') {
    // Pass width/height to UnifiedImage only if they are numbers and fill is not set
    const imageWidth = typeof width === 'number' && !fill ? width : undefined;
    const imageHeight = typeof height === 'number' && !fill ? height : undefined;

    return (
      <UnifiedImage
        placeholderId={placeholderId}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        unoptimized={unoptimized}
        style={combinedStyle}
        mediaOptions={mediaOptions}
        width={imageWidth}
        height={imageHeight}
        className={className}
        showLoading={showLoading}
      />
    );
  }

  return null;
}
