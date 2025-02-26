'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { 
  getCloudinaryImageUrl, 
  getCloudinaryImageProps, 
  CloudinaryImageOptions, 
  ImageArea 
} from '@/lib/cloudinary';

export interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  publicId: string;
  area?: ImageArea;
  alt: string;
  options?: CloudinaryImageOptions;
  responsive?: boolean;
  expandOnHover?: boolean;
  fallbackSrc?: string;
  className?: string;
}

/**
 * CloudinaryImage component for displaying Cloudinary images with proper optimization
 * 
 * @example
 * // Basic usage
 * <CloudinaryImage publicId="example" alt="Example image" />
 * 
 * // With area (using predefined dimensions)
 * <CloudinaryImage publicId="example" area="hero" alt="Hero image" />
 * 
 * // With custom options
 * <CloudinaryImage 
 *   publicId="example" 
 *   alt="Custom image" 
 *   options={{ width: 500, height: 300, crop: 'fill' }} 
 * />
 */
export function CloudinaryImage({
  publicId,
  area,
  alt,
  options = {},
  responsive = true,
  expandOnHover = false,
  fallbackSrc,
  className = "",
  ...props
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state if publicId changes
  useEffect(() => {
    setError(false);
  }, [publicId]);

  // Handle missing or empty publicId
  if (!publicId) {
    console.warn('CloudinaryImage: Missing publicId');
    return fallbackSrc ? (
      <Image
        src={fallbackSrc}
        alt={alt}
        className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        {...props}
      />
    ) : null;
  }

  // Get image props from Cloudinary
  const imageProps = getCloudinaryImageProps(publicId, options);

  // Handle error loading the image
  const handleError = () => {
    console.warn(`CloudinaryImage: Failed to load image with publicId: ${publicId}`);
    setError(true);
  };

  // Show fallback if there was an error
  if (error && fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        {...props}
      />
    );
  }

  // Generate the Cloudinary image URL
  const cloudinaryUrl = getCloudinaryImageUrl(publicId, options);

  return (
    <Image
      src={cloudinaryUrl}
      alt={alt}
      width={options.width || props.width || imageProps.width}
      height={options.height || props.height || imageProps.height}
      className={`${className} ${!isLoaded ? 'animate-pulse bg-gray-200' : ''} ${
        expandOnHover ? 'transition-transform hover:scale-105' : ''
      }`}
      onError={handleError}
      onLoad={() => setIsLoaded(true)}
      placeholder={imageProps.placeholder as "blur"}
      blurDataURL={imageProps.blurDataURL}
      {...props}
    />
  );
}

export default CloudinaryImage; 