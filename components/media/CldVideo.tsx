'use client';

import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';
import { useState, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CldEnhancedVideoProps {
  publicId: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  fallbackSrc?: string;
  showLoading?: boolean;
  fill?: boolean;
  transformation?: {
    quality?: string;
    height?: number;
    width?: number;
    crop?: string;
  }[];
  [key: string]: any;
}

/**
 * CldVideo component - An enhanced wrapper around next-cloudinary's CldVideoPlayer
 * 
 * Features:
 * - Uses Cloudinary's advanced video optimization
 * - Handles loading and error states
 * - Provides fallback for missing videos
 * - Supports responsive videos
 * 
 * @example
 * <CldVideo *   publicId="folder/video-name"
 *   width={1200}
 *   height={675}
 *   controls
 * / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
 */
export default function CldVideo({
  publicId,
  width,
  height,
  autoplay = false,
  autoPlay,
  loop = false,
  muted = false,
  controls = true,
  className = '',
  fallbackSrc = '/placeholder-video.mp4',
  showLoading = true,
  fill = false,
  transformation = [],
  ...props
}: CldEnhancedVideoProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set default width and height only if fill is false
  const videoWidth = !fill ? (width || 800) : undefined;
  const videoHeight = !fill ? (height || 450) : undefined;

  const shouldAutoplay = autoPlay !== undefined ? autoPlay : autoplay;

  const formattedPublicId = publicId.startsWith('/') ? publicId.substring(1) : publicId;

  // Memoized load handler
  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Memoized error handler
  const handleError = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to load Cloudinary video: ${publicId}`);
    }
    setError(true);
    setLoading(false);
  }, [publicId]);

  if (error) {
    if (!fallbackSrc) {
      return null;
    }
    
    return (
      <video
        src={fallbackSrc}
        width={videoWidth}
        height={videoHeight}
        controls={controls}
        autoPlay={shouldAutoplay}
        loop={loop}
        muted={muted}
        className={className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
        {...props}
      />
    );
  }
  
  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {loading && showLoading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <CldVideoPlayer
        id={`video-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`}
        src={formattedPublicId}
        width={fill ? "100%" : (videoWidth ? `${videoWidth}px` : "100%")}
        height={fill ? "100%" : (videoHeight ? `${videoHeight}px` : "100%")}
        autoplay={shouldAutoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={`${className} ${loading ? 'invisible' : 'visible'}`}
        onPlay={handleLoad}
        onError={handleError}
        transformation={transformation.length > 0 ? {
          quality: transformation[0]?.quality || "auto",
          height: transformation[0]?.height || videoHeight,
          width: transformation[0]?.width || videoWidth,
          crop: transformation[0]?.crop || "fill"
        } : {
          quality: "auto",
          crop: "fill"
        }}
        {...props}
      />
    </div>
  );
} 
