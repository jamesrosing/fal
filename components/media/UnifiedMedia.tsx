'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService, MediaOptions } from '@/lib/services/media-service';
import { getCloudinaryUrl, CloudinaryImageOptions } from '@/lib/cloudinary';
import { getMediaUrl } from '@/lib/media/utils';

// Consolidated props interface that covers all use cases
interface UnifiedMediaProps extends Omit<ImageProps, 'src'> {
  // Media identification (one of these is required)
  placeholderId?: string;
  publicId?: string;
  src?: string;

  // Media configuration
  mediaType?: 'image' | 'video' | 'auto';
  options?: MediaOptions & CloudinaryImageOptions;
  
  // UI customization
  fallbackSrc?: string;
  expandOnHover?: boolean;
  showLoading?: boolean;
  className?: string;
  containerClassName?: string;
  
  // Video specific props
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  
  // Custom error handling
  onError?: (error: any) => void;
  renderError?: (error: any) => React.ReactNode;
}

/**
 * UnifiedMedia - A comprehensive component for rendering media assets
 * 
 * Features:
 * - Supports placeholderId, publicId, or direct src URL
 * - Handles both images and videos
 * - Manages loading and error states
 * - Supports responsive layouts
 * - Provides fallback options
 * - Compatible with both media service and direct Cloudinary URLs
 * 
 * @example
 * // Using placeholderId (recommended)
 * <UnifiedMedia
 *   placeholderId="home-hero"
 *   alt="Home hero image"
 *   width={1200}
 *   height={600}
 *   priority
 * />
 * 
 * // Using direct Cloudinary publicId
 * <UnifiedMedia
 *   publicId="folder/image-name"
 *   alt="Direct Cloudinary image"
 *   width={800}
 *   height={400}
 *   options={{ quality: 90, crop: 'fill' }}
 * />
 * 
 * // Using direct URL
 * <UnifiedMedia
 *   src="https://example.com/image.jpg"
 *   alt="External image"
 *   width={500}
 *   height={300}
 * />
 */
export default function UnifiedMedia({
  // Media identification
  placeholderId,
  publicId,
  src,
  
  // Media configuration
  mediaType = 'auto',
  options = {},
  
  // UI customization
  fallbackSrc = '/images/global/placeholder-image.jpg',
  expandOnHover = false,
  showLoading = true,
  className = '',
  containerClassName = '',
  
  // Image props
  alt = '',
  width,
  height,
  sizes = '100vw',
  fill = false,
  priority = false,
  
  // Video props
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  
  // Custom handlers
  onError,
  renderError,
  
  // Remaining props
  ...props
}: UnifiedMediaProps) {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [mediaAsset, setMediaAsset] = useState<any>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(src || null);
  const [actualMediaType, setActualMediaType] = useState<'image' | 'video'>(mediaType === 'auto' ? 'image' : mediaType);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Resolve the appropriate source URL based on input props
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    // Reset error and loading state
    setLoadAttempts(0);
    
    // Case 1: Direct src URL is provided
    if (src) {
      setResolvedSrc(src);
      // Try to determine media type from extension
      if (mediaType === 'auto') {
        const isVideo = /\.(mp4|webm|ogv|mov)($|\?)/i.test(src);
        setActualMediaType(isVideo ? 'video' : 'image');
      }
      setLoading(false);
      return;
    }
    
    // Case 2: Cloudinary publicId is provided
    if (publicId) {
      try {
        const url = getCloudinaryUrl(publicId, options as CloudinaryImageOptions);
        if (isMounted) {
          setResolvedSrc(url);
          // For publicId, we need to determine media type if auto
          if (mediaType === 'auto') {
            // For Cloudinary, we'll assume image unless clearly marked as video
            const isVideo = publicId.includes('/video/') || /\.(mp4|webm|ogv|mov)$/i.test(publicId);
            setActualMediaType(isVideo ? 'video' : 'image');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error generating URL for publicId ${publicId}:`, err);
        if (isMounted) {
          setError(err);
          // Try fallback if available
          if (fallbackSrc) {
            setResolvedSrc(fallbackSrc);
          }
          setLoading(false);
          if (onError) onError(err);
        }
      }
      return;
    }
    
    // Case 3: PlaceholderId is provided (use media service)
    if (placeholderId) {
      const loadAsset = async () => {
        try {
          // Since getMediaByPlaceholderId doesn't exist in the current interface,
          // we are using the registry pattern implemented in this project
          const response = await fetch(`/api/media/${encodeURIComponent(placeholderId)}`);
          
          // If we get a 404 or other error, handle it
          if (!response.ok) {
            throw new Error(`API returned ${response.status} for placeholderId: ${placeholderId}`);
          }
          
          const asset = await response.json();
          
          if (isMounted) {
            if (asset) {
              setMediaAsset(asset);
              // Using the utility function directly instead of through mediaService
              // Get the publicId from the asset with safe fallback
              const assetPublicId = asset?.public_id || asset?.publicId || '';
              
              // Make sure we have a valid string before passing to getMediaUrl
              if (assetPublicId) {
                try {
                  const mediaUrl = getMediaUrl(assetPublicId, options);
                  setResolvedSrc(mediaUrl);
                  
                  // Set the media type based on asset type or fallback to provided type
                  const assetType = asset.type === 'video' ? 'video' : 'image';
                  setActualMediaType(mediaType === 'auto' ? assetType : mediaType);
                } catch (urlError) {
                  console.error(`Error generating URL for asset ${assetPublicId}:`, urlError);
                  if (fallbackSrc) {
                    setResolvedSrc(fallbackSrc);
                  } else {
                    throw urlError;
                  }
                }
              } else {
                throw new Error(`Asset found for placeholderId: ${placeholderId}, but no publicId or public_id found in asset`);
              }
            } else {
              throw new Error(`No asset found for placeholderId: ${placeholderId}`);
            }
            
            setLoading(false);
          }
        } catch (err) {
          console.error(`Error loading asset for placeholderId ${placeholderId}:`, err);
          if (isMounted) {
            setError(err);
            // Try fallback if available
            if (fallbackSrc) {
              setResolvedSrc(fallbackSrc);
              setLoading(false);
            } else {
              // Not having a valid publicId is a problem, try using the placeholder ID directly as a public ID
              // This is a last-resort fallback for cases where the registry is incomplete
              try {
                console.warn(`Attempting direct use of placeholderId as publicId: ${placeholderId}`);
                const lastResortUrl = getCloudinaryUrl(placeholderId, options as CloudinaryImageOptions);
                setResolvedSrc(lastResortUrl);
                setActualMediaType('image'); // Default assumption
                setLoading(false);
              } catch (lastResortError) {
                console.error('Last resort fallback also failed:', lastResortError);
                setLoading(false);
                if (onError) onError(err);
              }
            }
          }
        }
      };
      
      loadAsset();
    } else {
      // No valid source provided
      const errorMsg = 'No valid media source provided. Please specify src, publicId, or placeholderId.';
      console.error(errorMsg);
      setError(new Error(errorMsg));
      // Try fallback if available
      if (fallbackSrc) {
        setResolvedSrc(fallbackSrc);
      }
      setLoading(false);
      if (onError) onError(new Error(errorMsg));
    }
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId, publicId, src, mediaType, JSON.stringify(options), fallbackSrc, onError]);

  // Handle image load error
  const handleImageError = () => {
    setLoadAttempts(prev => prev + 1);
    
    // Only retry up to 2 times
    if (loadAttempts < 2) {
      console.warn(`UnifiedMedia: Failed to load media (Attempt ${loadAttempts + 1})`);
      
      try {
        // Try with different quality or format
        if (publicId) {
          const newOptions = { ...options, quality: 60, format: 'auto' };
          const newSrc = getCloudinaryUrl(publicId, newOptions as CloudinaryImageOptions);
          setResolvedSrc(newSrc);
        } else if (mediaAsset) {
          // Safely access mediaAsset properties
          const assetPublicId = mediaAsset?.public_id || mediaAsset?.publicId;
          
          // Only proceed if we have a valid public ID
          if (assetPublicId) {
            const newOptions = { ...options, quality: 60, format: 'auto' };
            try {
              const newSrc = getMediaUrl(assetPublicId, newOptions);
              setResolvedSrc(newSrc);
            } catch (err) {
              console.error('Error generating fallback URL:', err);
              setResolvedSrc(fallbackSrc);
            }
          } else {
            // No valid publicId found, use fallback
            console.error('No valid publicId found in mediaAsset:', mediaAsset);
            setResolvedSrc(fallbackSrc);
          }
        } else if (placeholderId) {
          // Try using placeholderId directly as a last resort
          try {
            const directUrl = getCloudinaryUrl(placeholderId, { 
              ...options, 
              quality: 60, 
              format: 'auto' 
            } as CloudinaryImageOptions);
            setResolvedSrc(directUrl);
          } catch (directErr) {
            setResolvedSrc(fallbackSrc);
          }
        } else {
          // No valid source for retry, use fallback
          setResolvedSrc(fallbackSrc);
        }
      } catch (unexpectedError) {
        console.error('Unexpected error in image error handler:', unexpectedError);
        setResolvedSrc(fallbackSrc);
      }
    } else {
      // Give up after max attempts
      console.error(`Failed to load media after ${loadAttempts + 1} attempts`);
      if (onError) onError(new Error(`Failed to load media after ${loadAttempts + 1} attempts`));
      setResolvedSrc(fallbackSrc);
    }
  };

  // Handle loading state
  if (loading && showLoading) {
    return (
      <Skeleton 
        className={`rounded overflow-hidden ${containerClassName}`} 
        style={{ 
          width: fill ? '100%' : (width ? `${width}px` : '100%'), 
          height: fill ? '100%' : (height ? `${height}px` : 'auto'), 
          aspectRatio: width && height ? `${width}/${height}` : undefined 
        }}
      />
    );
  }

  // Handle error state with custom renderer or fallback
  if (error) {
    if (renderError) {
      return renderError(error);
    }
    
    if (!fallbackSrc) {
      return (
        <div 
          className={`bg-gray-100 flex items-center justify-center text-sm text-gray-400 ${containerClassName}`}
          style={{ 
            width: fill ? '100%' : (width ? `${width}px` : '100%'), 
            height: fill ? '100%' : (height ? `${height}px` : '300px'), 
            aspectRatio: width && height ? `${width}/${height}` : undefined 
          }}
        >
          {error.message || 'Failed to load media'}
        </div>
      );
    }
    
    // Show fallback image
    return (
      <Image 
        src={fallbackSrc}
        alt={alt || 'Fallback image'}
        width={width || 800}
        height={height || 600}
        className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        sizes={sizes}
        fill={fill}
        priority={priority}
        {...props}
      />
    );
  }

  // No valid source to display
  if (!resolvedSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-sm text-gray-400 ${containerClassName}`}
        style={{ 
          width: fill ? '100%' : (width ? `${width}px` : '100%'), 
          height: fill ? '100%' : (height ? `${height}px` : '300px'), 
          aspectRatio: width && height ? `${width}/${height}` : undefined 
        }}
      >
        No media source available
      </div>
    );
  }

  // Render video for video type
  if (actualMediaType === 'video') {
    return (
      <div className={containerClassName}>
        <video
          src={resolvedSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline
          className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
          style={{ 
            width: fill ? '100%' : (width ? `${width}px` : undefined), 
            height: fill ? '100%' : (height ? `${height}px` : undefined),
            objectFit: 'cover' 
          }}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Render image for image type (default)
  const renderImage = () => {
    // Create a safe copy of props that we can modify if needed
    const safeImageProps: any = { 
      src: resolvedSrc || fallbackSrc,
      alt,
      className: `${className} ${loading ? 'animate-pulse bg-gray-200' : ''}`,
      ...props
    };

    // Handle width, height and fill conflict - Next.js Image requires either width/height OR fill, not both
    if (fill && (width || height)) {
      console.warn(
        `UnifiedMedia: Both 'fill' and dimension props (width/height) provided for ${placeholderId || publicId || src}. Using 'fill' and ignoring dimensions.`
      );
      // Remove width and height if fill is true (prioritize fill)
      delete safeImageProps.width;
      delete safeImageProps.height;
    } else {
      // Set the appropriate props based on what was provided
      if (fill) {
        safeImageProps.fill = fill;
      } else if (width || height) {
        // Only set width/height if they're defined
        if (width) safeImageProps.width = width;
        if (height) safeImageProps.height = height;
      } else {
        // If no dimensions are provided at all, use reasonable defaults
        safeImageProps.width = 800;
        safeImageProps.height = 600;
        console.warn(`UnifiedMedia: No dimensions provided for ${placeholderId || publicId || src}. Using defaults (800x600).`);
      }
    }

    // Set priority if specified
    if (priority) {
      safeImageProps.priority = true;
    }

    // Set sizes if available
    if (sizes) {
      safeImageProps.sizes = sizes;
    }

    return (
      <Image
        {...safeImageProps}
        onError={handleImageError}
      />
    );
  };

  return (
    <div className={containerClassName}>
      {renderImage()}
    </div>
  );
} 