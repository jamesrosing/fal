"use client";

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { getNextImageProps, getMediaUrl } from '@/lib/media/utils';
import { MediaOptions } from '@/lib/media/types';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  id: string;
  options?: MediaOptions;
  fallbackSrc?: string;
  fill?: boolean;
}

export function OptimizedImage({
  id,
  options = {},
  fallbackSrc,
  fill = false,
  alt = '',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = React.useState(false);
  
  // Get optimized image props
  const imageProps = getNextImageProps(id, {
    ...options,
    alt
  });
  
  // Handle error case
  const handleError = () => {
    if (fallbackSrc) {
      setError(true);
    }
  };
  
  // If we've had an error and have a fallback, use it
  const src = error && fallbackSrc ? fallbackSrc : imageProps.src;
  
  // Render with fill mode if requested
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        onError={handleError}
        blurDataURL={imageProps.blurDataURL}
        placeholder="blur"
        {...props}
      />
    );
  }
  
  // Regular rendering with width and height
  return (
    <Image
      src={src}
      width={imageProps.width}
      height={imageProps.height}
      alt={alt}
      onError={handleError}
      blurDataURL={imageProps.blurDataURL}
      placeholder="blur"
      {...props}
    />
  );
}

export default OptimizedImage; 