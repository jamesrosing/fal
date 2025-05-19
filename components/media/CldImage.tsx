'use client';

import { CldImage as NextCloudinaryImage } from 'next-cloudinary';
import { useState, useCallback, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CldEnhancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  quality?: number | string;
  fallbackSrc?: string;
  showLoading?: boolean;
  fill?: boolean;
  config?: {
    cloud?: {
      cloudName?: string;
    };
  };
}

/**
 * CldImage component - An enhanced wrapper around next-cloudinary's CldImage
 * 
 * Features:
 * - Uses Cloudinary's advanced image optimization
 * - Handles loading and error states
 * - Supports responsive images
 * - Provides fallback for missing images
 * - Correctly handles fill vs width/height property conflicts
 * 
 * @example
 * <CldImage
 *   src="folder/image-name"
 *   alt="Description of the image"
 *   width={1200}
 *   height={600}
 *   priority
 *   config={{ cloud: { cloudName: 'your-cloud-name' } }} <!-- Optional: override default cloud name -->
 * />
 */
export default function CldImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = '100vw',
  className = '',
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  fallbackSrc = '/placeholder-image.jpg',
  showLoading = true,
  fill = false,
  config,
  ...props
}: CldEnhancedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // If fill is true, width and height should not be passed to NextCloudinaryImage
  // Set default width and height only if fill is false
  const imgWidth = useMemo(() => {
    return !fill ? (width || 800) : undefined;
  }, [fill, width]);
  
  const imgHeight = useMemo(() => {
    return !fill ? (height || 600) : undefined;
  }, [fill, height]);

  // For development warning about conflicting props
  useMemo(() => {
    if (process.env.NODE_ENV === 'development' && fill && (width || height)) {
      console.warn(
        `Warning: Both 'fill' and 'width/height' props provided to CldImage for src="${src}". ` +
        `When 'fill' is used, 'width' and 'height' are ignored. Using 'fill=${fill}'.`
      );
    }
  }, [fill, width, height, src]);

  // Memoized image config
  const imageConfig = useMemo(() => config, [JSON.stringify(config)]);

  // Memoized error handler
  const handleError = useCallback((e: any) => {
    // Use only in development mode or with a DEBUG flag
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error loading Cloudinary image: ${src}`, e);
    }
    setError(true);
  }, [src]);
  
  // Memoized load handler
  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Memoize aspect ratio calculation for skeleton
  const aspectRatio = useMemo(() => {
    if (!fill && imgWidth && imgHeight) {
      return imgWidth / imgHeight;
    }
    return undefined;
  }, [fill, imgWidth, imgHeight]);

  // Memoize skeleton style
  const skeletonStyle = useMemo(() => ({
    width: fill ? '100%' : (imgWidth ? `${imgWidth}px` : '100%'), 
    height: fill ? '100%' : (imgHeight ? `${imgHeight}px` : 'auto'), 
    aspectRatio
  }), [fill, imgWidth, imgHeight, aspectRatio]);

  // Handle error state
  if (error) {
    if (!fallbackSrc) {
      return null;
    }
    
    // For fallbacks that aren't Cloudinary images, use img directly
    return (
      <img 
        src={fallbackSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        className={className}
        style={{
          objectFit: crop === 'fill' ? 'cover' : 'contain',
          ...(fill ? { width: '100%', height: '100%', objectFit: 'cover' } : {})
        }}
        {...props}
      />
    );
  }
  
  return (
    <>
      {loading && showLoading && (
        <Skeleton 
          className={`rounded overflow-hidden ${className}`}
          style={skeletonStyle}
        />
      )}
      <NextCloudinaryImage
        src={src}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        sizes={sizes}
        className={`${className} ${loading ? 'invisible' : 'visible'}`}
        onError={handleError}
        onLoad={handleLoad}
        crop={crop}
        gravity={gravity}
        quality={quality}
        format="auto"
        config={imageConfig}
        fill={fill}
        {...props}
      />
    </>
  );
} 