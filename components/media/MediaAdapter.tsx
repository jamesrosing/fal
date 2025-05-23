"use client";

import React, { useMemo } from 'react';
import CldImage from './CldImage';
import CldVideo from './CldVideo';
import Image from 'next/image';

// Define the component props
interface MediaAdapterProps {
  src?: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  mediaType?: 'image' | 'video';
  fallbackSrc?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  options?: any;
}

/**
 * MediaAdapter component - A simpler replacement for UnifiedMedia
 * 
 * This component adapts to different types of media sources:
 * - Cloudinary public IDs via CldImage/CldVideo
 * - Regular image URLs via Next Image
 * - Video files via HTML video element
 * 
 * Property conflicts are properly handled (e.g., fill vs width/height)
 */
export default function MediaAdapter({
  src,
  publicId,
  alt,
  width = 800,
  height = 600,
  fill = false,
  priority = false,
  className = '',
  sizes = '100vw',
  mediaType = 'image',
  fallbackSrc = '/images/placeholder.jpg',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  options = {}
}: MediaAdapterProps) {
  // Enhanced cloudinary configuration
  const cloudinaryConfig = useMemo(() => ({
    cloud: { cloudName: 'dyrzyfg3w' }
  }), []);
  
  // Determine if we should use width/height props based on fill value
  const dimensionProps = useMemo(() => {
    if (fill) {
      return {}; // Don't use width/height when fill is true
    }
    return { width, height };
  }, [fill, width, height]);
  
  // If publicId is provided, use Cloudinary components
  if (publicId) {
    if (mediaType === 'video') {
      return (
        <CldVideo 
          publicId={publicId}
          {...dimensionProps}
          className={className}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          fill={fill}
          config={cloudinaryConfig}
          {...options}
        />
      );
    }
    
    return (
      <CldImage 
        src={publicId}
        alt={alt}
        {...dimensionProps}
        priority={priority}
        className={className}
        sizes={sizes}
        fill={fill}
        config={cloudinaryConfig}
        {...options}
      />
    );
  }
  
  // If we have a direct URL
  if (src) {
    if (mediaType === 'video') {
      return (
        <video
          src={src}
          {...(!fill ? { width, height } : {})}
          className={className}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
        />
      );
    }
    
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      );
    }
    
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }
  
  // Fallback
  if (fill) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
      />
    );
  }
  
  return (
    <Image
      src={fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
    />
  );
} 