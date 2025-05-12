'use client';

import { CldImage as NextCloudinaryImage } from 'next-cloudinary';
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CldEnhancedImageProps {
  publicId: string;
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
 *   publicId="folder/image-name"
 *   alt="Description of the image"
 *   width={1200}
 *   height={600}
 *   priority
 * />
 */
export default function CldImage({
  publicId,
  alt,
  width = 800,
  height = 600,
  priority = false,
  sizes = '100vw',
  className = '',
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  fallbackSrc = '/placeholder-image.jpg',
  showLoading = true,
  ...props
}: CldEnhancedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

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
        width={width}
        height={height}
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
            width: width || '100%', 
            height: height || 'auto', 
            aspectRatio: width && height ? width / height : undefined 
          }}
        />
      )}
      <NextCloudinaryImage
        publicId={publicId}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={(e) => {
          console.error(`Error loading Cloudinary image: ${publicId}`, e);
          setError(true);
        }}
        onLoad={() => {
          console.log(`Successfully loaded Cloudinary image: ${publicId}`);
          setLoading(false);
        }}
        crop={crop}
        gravity={gravity}
        quality={quality}
        format="auto"
        {...props}
      />
    </>
  );
} 