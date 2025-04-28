'use client';

import { CldVideoPlayer } from 'next-cloudinary';
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CldEnhancedVideoProps {
  publicId: string;
  width?: number;
  height?: number;
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
  autoPlay = false,
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

  // Handle error state
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
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        className={className}
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
      <CldVideoPlayer
        id={`video-${publicId.replace(/\//g, '-')}`}
        width={width}
        height={height}
        src={publicId}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setError(true)}
        onPlay={() => setLoading(false)}
        transformation={transformation}
        {...props}
      />
    </>
  );
} 