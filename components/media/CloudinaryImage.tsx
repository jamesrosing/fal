'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { 
  CloudinaryImageOptions, 
  ImageArea,
  IMAGE_PLACEMENTS
} from '@/lib/cloudinary';
import { 
  generateCloudinaryUrl, 
  generateSrcSet
} from '@/lib/cloudinary-url';

export interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  publicId: string;
  area?: ImageArea;
  alt: string;
  options?: CloudinaryImageOptions;
  responsive?: boolean;
  expandOnHover?: boolean;
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  loadingStrategy?: 'lazy' | 'eager';
  quality?: number;
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
  priority = false,
  loadingStrategy = 'lazy',
  quality = 80,
  ...props
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [srcSet, setSrcSet] = useState<string>('');
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;

  // Create data URL for placeholder
  const placeholderDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  // Reset state and generate URLs when publicId changes
  useEffect(() => {
    // Reset state
    setError(false);
    setIsLoaded(false);
    retryCount.current = 0;
    
    // Skip if no publicId
    if (!publicId) {
      console.warn('CloudinaryImage: No publicId provided');
      setError(true);
      setImageUrl('');
      setSrcSet('');
      return;
    }
    
    try {
      // Set up image options based on area or custom options
      let imageOptions: CloudinaryImageOptions = { ...options };
      
      // If area is specified, use predefined dimensions and options
      if (area && IMAGE_PLACEMENTS[area]) {
        const placement = IMAGE_PLACEMENTS[area];
        const { width, height } = placement.dimensions;
        
        imageOptions = {
          ...imageOptions,
          width: imageOptions.width || width,
          height: imageOptions.height || height,
          crop: imageOptions.crop || 'fill',
          gravity: imageOptions.gravity || 'auto',
          quality: imageOptions.quality || quality
        };
      }
      
      // Generate main image URL
      const url = generateCloudinaryUrl(publicId, imageOptions);
      setImageUrl(url);
      
      // Generate srcSet for responsive images if needed
      if (responsive) {
        const widths = [320, 640, 960, 1280, 1920].filter(w => 
          !imageOptions.width || w <= imageOptions.width * 2
        );
        
        const srcSetStr = generateSrcSet(publicId, widths, imageOptions);
        setSrcSet(srcSetStr);
      }
    } catch (err) {
      console.error('Error generating Cloudinary image URLs:', err);
      setError(true);
    }
  }, [publicId, area, options, responsive, quality]);

  // Handle missing or empty publicId
  if (!publicId) {
    const width = options.width || props.width || 200;
    const height = options.height || props.height || 150;
    
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallbackSrc || placeholderDataUrl}
          alt={alt || "Image placeholder"}
          width={width}
          height={height}
          className={expandOnHover ? 'transition-transform hover:scale-105' : ''}
          {...props}
        />
      </div>
    );
  }

  // Handle error loading the image
  const handleError = () => {
    retryCount.current += 1;
    console.warn(`CloudinaryImage: Failed to load image ${publicId} (Attempt ${retryCount.current}/${MAX_RETRIES})`);
    
    if (retryCount.current <= MAX_RETRIES) {
      // Try with simplifiedMode for the retry
      const retryUrl = generateCloudinaryUrl(publicId, { 
        ...options, 
        simplifiedMode: retryCount.current === 1 ? true : false 
      });
      
      setImageUrl(retryUrl);
    } else {
      console.error(`CloudinaryImage: All ${MAX_RETRIES} attempts failed for ${publicId}`);
      setError(true);
    }
  };

  // Show fallback if there was an error
  if (error) {
    const width = options.width || props.width || 200;
    const height = options.height || props.height || 150;
    
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallbackSrc || placeholderDataUrl}
          alt={alt}
          width={width}
          height={height}
          className={expandOnHover ? 'transition-transform hover:scale-105' : ''}
          {...props}
        />
      </div>
    );
  }

  // Handle successful load
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If area specifies dimensions or options has dimensions
  const width = options.width || (area && IMAGE_PLACEMENTS[area]?.dimensions.width) || props.width;
  const height = options.height || (area && IMAGE_PLACEMENTS[area]?.dimensions.height) || props.height;
  
  // If fill property is passed, we need different rendering
  if (props.fill) {
    return (
      <div className={`relative ${className} ${!isLoaded ? 'animate-pulse bg-gray-200' : ''}`}>
        <Image
          key={publicId + '-' + retryCount.current}
          src={imageUrl || placeholderDataUrl}
          alt={alt}
          fill
          sizes={props.sizes || '100vw'}
          onError={handleError}
          onLoad={handleLoad}
          className={`${!isLoaded ? 'opacity-0' : 'opacity-100'} ${
            expandOnHover ? 'transition-transform hover:scale-105' : ''
          } transition-opacity duration-300`}
          loading={loadingStrategy}
          priority={priority}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  // Regular rendering with width and height
  return (
    <div className={`relative ${className}`}>
      <Image
        key={publicId + '-' + retryCount.current}
        src={imageUrl || placeholderDataUrl}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={`${!isLoaded ? 'opacity-0' : 'opacity-100'} ${
          expandOnHover ? 'transition-transform hover:scale-105' : ''
        } transition-opacity duration-300`}
        loading={loadingStrategy}
        priority={priority}
        {...props}
      />
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

export default CloudinaryImage; 