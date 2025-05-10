'use client';

import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';
import { useState } from 'react';
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
 * <CldVideo
 *   publicId="folder/video-name"
 *   width={1200}
 *   height={675}
 *   controls
 * />
 */
export default function CldVideo({
  publicId,
  width = 800,
  height = 450,
  autoplay = false,
  autoPlay,
  loop = false,
  muted = false,
  controls = true,
  className = '',
  fallbackSrc = '/placeholder-video.mp4',
  showLoading = true,
  transformation = [],
  ...props
}: CldEnhancedVideoProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const shouldAutoplay = autoPlay !== undefined ? autoPlay : autoplay;

  const formattedPublicId = publicId.startsWith('/') ? publicId.substring(1) : publicId;

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    console.error(`Failed to load Cloudinary video: ${publicId}`);
    setError(true);
    setLoading(false);
  };

  if (error) {
    if (!fallbackSrc) {
      return null;
    }
    
    return (
      <video
        src={fallbackSrc}
        width={width}
        height={height}
        controls={controls}
        autoPlay={shouldAutoplay}
        loop={loop}
        muted={muted}
        className={className}
        {...props}
      />
    );
  }
  
  return (
    <div className="relative">
      {loading && showLoading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      <CldVideoPlayer
        id={`video-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`}
        src={formattedPublicId}
        width={width ? `${width}px` : "100%"}
        height={height ? `${height}px` : "100%"}
        autoplay={shouldAutoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={`${className} ${loading ? 'invisible' : 'visible'}`}
        onPlay={handleLoad}
        onError={handleError}
        transformation={transformation ? {
          quality: transformation[0]?.quality || "auto",
          height: transformation[0]?.height || height,
          width: transformation[0]?.width || width,
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
