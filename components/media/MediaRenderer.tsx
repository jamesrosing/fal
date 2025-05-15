'use client';

import React from 'react';
import { mediaService } from '@/lib/services/media-service';
import CldImage from './CldImage';
import CldVideo from './CldVideo';

interface MediaRendererProps {
  publicId: string;
  mediaType: 'image' | 'video';
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  
  // Video-specific props
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  
  // Other options
  quality?: number | string;
  options?: Record<string, any>;
}

/**
 * MediaRenderer component - A utility for rendering media based on type
 * 
 * This component simplified from the previous version to work directly with Cloudinary
 * It automatically selects between CldImage and CldVideo based on mediaType
 */
export default function MediaRenderer({
  publicId,
  mediaType,
  alt = '',
  width = 800,
  height = 600,
  className = '',
  fill = false,
  priority = false,
  sizes = '100vw',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  quality = 'auto',
  options = {}
}: MediaRendererProps) {
  if (!publicId) {
    console.warn('MediaRenderer: No publicId provided');
    return null;
  }
  
  // Render image
  if (mediaType === 'image') {
    return (
      <CldImage src={publicId}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={sizes}
        quality={quality}
        {...options}
      / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
    );
  }
  
  // Render video
  if (mediaType === 'video') {
    return (
      <CldVideo src={publicId}
        width={width}
        height={height}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        alt={alt}
        {...options}
      / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
    );
  }
  
  return null;
}
