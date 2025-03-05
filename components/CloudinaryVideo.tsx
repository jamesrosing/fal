'use client';

import { useRef, useState, useEffect } from 'react';
import {
  getCloudinaryUrl,
  getCloudinaryVideoUrl,
  getCloudinaryVideoSources,
  CloudinaryVideoOptions,
  CloudinaryImageOptions,
  ImageFormat,
  VideoFormat
} from '@/lib/cloudinary';

export interface CloudinaryVideoProps {
  publicId: string;
  options?: CloudinaryVideoOptions;
  thumbnailOptions?: { 
    publicId?: string; 
    format?: 'jpg' | 'png' | 'webp'; 
    quality?: number 
  };
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  className?: string;
  responsive?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  fallbackSrc?: string;
}

/**
 * CloudinaryVideo component for displaying Cloudinary videos with proper optimization
 * 
 * @example
 * // Basic usage
 * <CloudinaryVideo publicId="example" />
 * 
 * // With custom options
 * <CloudinaryVideo 
 *   publicId="example" 
 *   options={{ width: 720, format: 'mp4' }}
 *   autoPlay
 *   loop
 *   muted
 * />
 * 
 * // With custom thumbnail
 * <CloudinaryVideo 
 *   publicId="example"
 *   thumbnailOptions={{ publicId: "thumbnail-image" }}
 * />
 */
export function CloudinaryVideo({
  publicId,
  options = {},
  thumbnailOptions = {},
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  playsInline = true,
  className = "",
  responsive = true,
  onReady,
  onEnded,
  fallbackSrc
}: CloudinaryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state if publicId changes
  useEffect(() => {
    setError(false);
  }, [publicId]);

  // Handle missing or empty publicId
  if (!publicId) {
    console.warn('CloudinaryVideo: Missing publicId');
    return fallbackSrc ? (
      <video
        src={fallbackSrc}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        className={className}
        onEnded={onEnded}
      />
    ) : null;
  }

  // Generate video sources for different formats and resolutions
  const sources = getCloudinaryVideoSources(publicId, {
    formats: ['mp4', 'webm'],
    widths: [480, 720, 1080],
    baseOptions: options
  });

  // Generate poster image URL from the video or custom thumbnail
  const posterUrl = thumbnailOptions.publicId
    ? getCloudinaryUrl(thumbnailOptions.publicId, {
        format: thumbnailOptions.format || 'auto',
        quality: thumbnailOptions.quality || 80
      })
    : getCloudinaryUrl(`${publicId.replace(/\.[^/.]+$/, '')}.jpg`, {
        format: 'auto',
        quality: 70
      });

  // Handle error loading the video
  const handleError = () => {
    console.warn(`CloudinaryVideo: Failed to load video with publicId: ${publicId}`);
    setError(true);
  };

  // Show fallback if there was an error
  if (error && fallbackSrc) {
    return (
      <video
        src={fallbackSrc}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        className={className}
        onEnded={onEnded}
      />
    );
  }

  // Handle video ready event
  const handleCanPlay = () => {
    setIsLoaded(true);
    if (onReady) onReady();
  };

  return (
    <video
      ref={videoRef}
      poster={posterUrl}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline={playsInline}
      className={`${className} ${!isLoaded ? 'animate-pulse bg-gray-200' : ''}`}
      onCanPlay={handleCanPlay}
      onError={handleError}
      onEnded={onEnded}
    >
      {sources.map((source, index) => (
        <source key={index} src={source.src} type={source.type} media={source.media} />
      ))}
      Your browser does not support the video tag.
    </video>
  );
}

export default CloudinaryVideo; 