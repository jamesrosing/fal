'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

export interface CldImageWrapperProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  area?: ImageArea;
  responsive?: boolean;
  priority?: boolean;
  expandOnHover?: boolean;
  fallbackSrc?: string;
  className?: string;
}

export function CldImageWrapper({
  publicId,
  alt,
  width,
  height,
  sizes = '100vw',
  area,
  responsive = true,
  priority = false,
  expandOnHover = false,
  fallbackSrc,
  className = '',
}: CldImageWrapperProps) {
  const [error, setError] = useState(false);

  // Handle missing or empty publicId
  if (!publicId || error) {
    // Use fallback image if provided
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt || 'Placeholder image'}
          width={width || 200}
          height={height || 150}
          className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        />
      );
    }
    
    // Use default placeholder
    return (
      <div 
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ width: `${width || 200}px`, height: `${height || 150}px` }}
      />
    );
  }

  // If area is specified, get default dimensions and options
  let finalWidth = width;
  let finalHeight = height;
  let cropMode: 'fill' | 'crop' | 'scale' | 'thumb' | 'pad' = 'fill';
  let gravity = 'auto';
  
  if (area && IMAGE_PLACEMENTS[area]) {
    const areaConfig = IMAGE_PLACEMENTS[area];
    finalWidth = finalWidth || areaConfig.dimensions.width;
    finalHeight = finalHeight || areaConfig.dimensions.height;
    
    // Extract transformations from area config
    const cropTransform = areaConfig.transformations.find(t => t.startsWith('c_'));
    const gravityTransform = areaConfig.transformations.find(t => t.startsWith('g_'));
    
    if (cropTransform) {
      const cropValue = cropTransform.substring(2);
      if (cropValue === 'fill' || cropValue === 'crop' || cropValue === 'scale' || cropValue === 'thumb' || cropValue === 'pad') {
        cropMode = cropValue;
      }
    }
    if (gravityTransform) gravity = gravityTransform.substring(2);
  }

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={finalWidth || 800}
      height={finalHeight || 600}
      sizes={responsive ? sizes : undefined}
      crop={cropMode}
      gravity={gravity}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
      onError={() => setError(true)}
    />
  );
}

export default CldImageWrapper; 