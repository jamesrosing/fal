// components/media/ServerImage.tsx
import Image from 'next/image';
import { mediaService } from '@/lib/services/media-service';
import { MediaOptions } from '@/lib/media/types';

/**
 * Server Image Component
 * 
 * This is a Server Component that loads media by placeholder ID directly on the server.
 * It's more efficient than the client component because:
 * 1. No client-side JS is needed
 * 2. No hydration is required
 * 3. The image is rendered immediately with the correct props
 */
interface ServerImageProps {
  placeholderId: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  options?: Partial<MediaOptions>;
}

export async function ServerImage({
  placeholderId,
  alt = '',
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes,
  quality,
  options = {}
}: ServerImageProps) {
  // Get media asset by placeholder ID
  const asset = await mediaService.getMediaByPlaceholderId(placeholderId);
  
  // If no asset found, return placeholder
  if (!asset) {
    if (fill) {
      return (
        <Image 
          src="/images/placeholder.jpg"
          alt={alt || "Image not found"}
          fill
          className={className}
        />
      );
    }
    
    return (
      <Image 
        src="/images/placeholder.jpg"
        alt={alt || "Image not found"}
        width={width || 800}
        height={height || 600}
        className={className}
      />
    );
  }
  
  // Merge options
  const mergedOptions: MediaOptions = {
    ...options,
    width: width || options.width || asset.defaultOptions.width,
    height: height || options.height,
    quality: quality || options.quality || asset.defaultOptions.quality,
    alt: alt || asset.description,
  };
  
  // Get image URL with transformations
  const imageUrl = mediaService.getMediaUrl(asset.publicId, mergedOptions);
  
  // Using Next.js Image with provided dimensions
  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt || asset.description}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }
  
  // Calculate responsive height if needed
  const calculatedHeight = height || 
    (asset.dimensions?.aspectRatio && width 
      ? Math.round(width / asset.dimensions.aspectRatio) 
      : undefined) || 
    asset.dimensions?.height || 
    600;
  
  return (
    <Image
      src={imageUrl}
      alt={alt || asset.description}
      width={width || asset.dimensions?.width || 800}
      height={calculatedHeight}
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}

export default ServerImage;