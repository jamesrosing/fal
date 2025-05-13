'use client';

import { CldImage as NextCloudinaryImage } from 'next-cloudinary';
import { useState, useCallback } from 'react';
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

  // Set default width and height only if fill is false
  const imgWidth = !fill ? (width || 800) : undefined;
  const imgHeight = !fill ? (height || 600) : undefined;

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

  // Handle error state
  if (error) {
    if (!fallbackSrc) {
      return null;
    }
    
    // For fallbacks that aren't Cloudinary images, use src directly
    return (
      <img 
        src={fallbackSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        className={className}
        style={{
          objectFit: crop === 'fill' ? 'cover' : 'contain',
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
          style={{ 
            width: fill ? '100%' : (imgWidth || '100%'), 
            height: fill ? '100%' : (imgHeight || 'auto'), 
            aspectRatio: (!fill && imgWidth && imgHeight) ? imgWidth / imgHeight : undefined 
          }}
        />
      )}
      <NextCloudinaryImage
        src={src}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        sizes={sizes}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        crop={crop}
        gravity={gravity}
        quality={quality}
        format="auto"
        config={config}
        fill={fill}
        {...props}
      />
    </>
  );
} 