'use client';

import React from 'react';
import { mediaService } from '@/lib/services/media-service';
import UnifiedImage from './UnifiedImage';
import UnifiedVideo from './UnifiedVideo';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface MediaRendererProps {
  placeholderId: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  quality?: number;
  fallbackSrc?: string;
  showLoading?: boolean;
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
  alt = '',
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  quality = 80,
  fallbackSrc,
  showLoading = true
}: MediaRendererProps) {
  // State to track the media type (initially unknown)
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | 'unknown'>('unknown');
  
  // Fetch the media type on component mount
  React.useEffect(() => {
    let isMounted = true;
    
    async function detectMediaType() {
      try {
        const asset = await mediaService.getMediaByPlaceholderId(placeholderId);
        if (isMounted && asset) {
          setMediaType(asset.type as 'image' | 'video');
        }
      } catch (err) {
        console.error(`Error detecting media type for ${placeholderId}:`, err);
        if (isMounted) {
          setMediaType('unknown');
        }
      }
    }
    
    detectMediaType();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId]);
  
  // Render the appropriate component based on media type
  if (mediaType === 'video') {
    return (
      <UnifiedVideo
        placeholderId={placeholderId}
        options={{
          autoPlay,
          muted,
          loop,
          controls,
          quality
        }}
        className={className}
        width={width}
        height={height}
        fallbackSrc={fallbackSrc}
        showLoading={showLoading}
      />
    );
  }
  
  // For images or unknown media type (default to image)
  return (
    <UnifiedImage
      placeholderId={placeholderId}
      alt={alt}
      className={className}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      sizes={sizes}
      options={{ quality }}
      fallbackSrc={fallbackSrc}
      showLoading={showLoading}
    />
  );
}
