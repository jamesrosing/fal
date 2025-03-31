'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { 
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';

  getCloudinaryUrl, 
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
  const [useSimpleUrl, setUseSimpleUrl] = useState(true); // Start with simple URL by default
  const [imageUrl, setImageUrl] = useState<string>('');
  const hasAttemptedFallback = useRef(false);
  const loadAttempts = useRef(0);

  // Reset error state if publicId changes
  useEffect(() => {
    setError(false);
    setIsLoaded(false);
    hasAttemptedFallback.current = false;
    loadAttempts.current = 0;
    
    // Generate the appropriate URL based on current state
    if (publicId) {
      // Always start with simplified mode
      const url = getCloudinaryUrl(publicId, { ...options, simplifiedMode: true });
      setImageUrl(url || '');
      console.log(`Setting image URL for ${publicId}: ${url}`);
    } else {
      // Make sure imageUrl is never empty
      setImageUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==');
    }
  }, [publicId, options]);

  // Handle missing or empty publicId
  if (!publicId || publicId === '') {
    console.warn('CloudinaryImage: Missing or empty publicId');
    // Use an inline data URI as a fallback to avoid network requests
    const fallbackImageSrc = fallbackSrc || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
    
    return (
      <Image
        src={fallbackImageSrc}
        alt={alt || "Placeholder image"}
        width={options.width || props.width || 200}
        height={options.height || props.height || 150}
        className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        {...props}
      />
    );
  }

  // Get image props from Cloudinary (for blur data)
  const imageProps = getCloudinaryImageProps(publicId, options);

  // Handle error loading the image
  const handleError = () => {
    loadAttempts.current += 1;
    console.warn(`CloudinaryImage: Failed to load image with publicId: ${publicId} (Attempt ${loadAttempts.current})`);
    
    // Only try alternative URL format once to avoid loops
    if (!hasAttemptedFallback.current && loadAttempts.current <= 2) {
      console.log('Trying alternate URL format...');
      hasAttemptedFallback.current = true;
      
      // Try the other URL format
      const newUrl = !useSimpleUrl 
        ? getCloudinaryUrl(publicId, { ...options, simplifiedMode: true })
        : getCloudinaryUrl(publicId, options);
      
      console.log(`New URL: ${newUrl}`);
      setUseSimpleUrl(!useSimpleUrl);
      setImageUrl(newUrl);
    } else {
      console.error(`CloudinaryImage: All attempts failed for ${publicId}`);
      setError(true);
    }
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

  return (
    <div className="relative">
      <Image
        key={`${publicId}-${useSimpleUrl}`} // Add key to prevent remounting issues
        src={imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
        alt={alt}
        width={options.width || props.width || imageProps.width || 200}
        height={options.height || props.height || imageProps.height || 150}
        className={`${className} ${!isLoaded ? 'animate-pulse bg-gray-200' : ''} ${
          expandOnHover ? 'transition-transform hover:scale-105' : ''
        }`}
        onError={handleError}
        onLoad={() => {
          console.log(`Image loaded successfully: ${publicId}`);
          setIsLoaded(true);
        }}
        placeholder={imageProps.placeholder as "blur"}
        blurDataURL={imageProps.blurDataURL}
        {...props}
      />
    </div>
  );
}

export default CloudinaryImage; 