"use client";

import React from 'react';
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
  // If publicId is provided, use Cloudinary components
  if (publicId) {
    if (mediaType === 'video') {
      return (
        <CldVideo
          publicId={publicId}
          width={width}
          height={height}
          className={className}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          alt={alt}
          {...options}
        />
      );
    }
    
    return (
      <CldImage
        publicId={publicId}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        sizes={sizes}
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
          width={width}
          height={height}
          className={className}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
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