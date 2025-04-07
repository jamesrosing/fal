'use client';

import React, { useRef, useEffect, useState } from 'react';
import NextImage from 'next/image';
import { mediaService, MediaAsset, MediaOptions } from '@/lib/services/media-service';
import { Skeleton } from "@/components/ui/skeleton";

// Define more specific video options if needed, inheriting from MediaOptions
interface VideoSpecificOptions extends MediaOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
}

interface UnifiedVideoProps {
  placeholderId: string;
  options?: VideoSpecificOptions;
  className?: string;
  posterPlaceholderId?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  showLoading?: boolean;
  // No fallbackSrc for video, use poster or just show error/nothing
}

/**
 * UnifiedVideo component - A video component with advanced features
 * 
 * Features:
 * - Automatically resolves placeholder IDs to Cloudinary URLs
 * - Multiple formats and resolutions for optimal performance
 * - Poster images for better UX
 * - Loading and error states
 * 
 * @example
 * <UnifiedVideo
 *   placeholderId="home-hero-video"
 *   posterPlaceholderId="home-hero-poster"
 *   options={{ autoPlay: true, muted: true, loop: true }}
 *   width={1200}
 *   height={600}
 * />
 */
export default function UnifiedVideo({
  placeholderId,
  options = {},
  className = '',
  posterPlaceholderId,
  width,
  height,
  style,
  onLoad,
  onError,
  showLoading = true,
}: UnifiedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoAsset, setVideoAsset] = useState<MediaAsset | null>(null);
  const [posterAsset, setPosterAsset] = useState<MediaAsset | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const {
    autoPlay = false,
    muted = true,
    loop = false,
    controls = false,
    playsInline = true,
    ...mediaOpts
  } = options;

  useEffect(() => {
    let isMounted = true;
    async function loadAssets() {
      setIsLoading(true);
      setHasError(false);
      setVideoAsset(null);
      setPosterAsset(null);
      setVideoUrl(null);
      setPosterUrl(null);

      try {
        const [fetchedVideoAsset, fetchedPosterAsset] = await Promise.all([
          mediaService.getMediaByPlaceholderId(placeholderId),
          posterPlaceholderId ? mediaService.getMediaByPlaceholderId(posterPlaceholderId) : Promise.resolve(null)
        ]);

        if (isMounted) {
          if (fetchedVideoAsset && fetchedVideoAsset.type === 'video') {
            setVideoAsset(fetchedVideoAsset);
            const url = mediaService.getMediaUrl(fetchedVideoAsset, mediaOpts);
            setVideoUrl(url);
          } else {
            if (fetchedVideoAsset) {
              console.warn(`Asset for placeholderId '${placeholderId}' is not a video.`);
            }
            setHasError(true);
          }

          if (fetchedPosterAsset && fetchedPosterAsset.type === 'image') {
            setPosterAsset(fetchedPosterAsset);
            const posterOpts: MediaOptions = { format: 'auto', quality: 'auto' };
            const pUrl = mediaService.getMediaUrl(fetchedPosterAsset, posterOpts);
            setPosterUrl(pUrl);
          } else if (posterPlaceholderId) {
            console.warn(`Asset for posterPlaceholderId '${posterPlaceholderId}' is not an image or not found.`);
          }
        }
      } catch (err) {
        console.error(`Error loading assets for video placeholderId '${placeholderId}':`, err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAssets();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderId, posterPlaceholderId, JSON.stringify(mediaOpts)]);

  // Handle Video Element Events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    const handleLoadedData = () => {
      onLoad?.();
      if (autoPlay) {
        videoElement.play().catch(e => console.warn('Video autoplay failed:', e));
      }
    };
    const handleErrorEvent = (e: Event) => {
      console.error('Video element error:', placeholderId, e);
      setHasError(true);
      onError?.();
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleErrorEvent);

    videoElement.src = videoUrl;

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleErrorEvent);
      if (videoElement) {
        videoElement.src = '';
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [videoUrl, autoPlay, onLoad, onError, placeholderId]);

  // Helper function to get CSS compatible size
  const getSize = (value: number | string | undefined): string | undefined => {
    if (typeof value === 'number') return `${value}px`;
    return value; // Assumes string is a valid CSS size (e.g., '100%')
  };

  const styleWidth = getSize(width);
  const styleHeight = getSize(height);

  // Combine provided style with calculated dimensions
  const combinedStyle: React.CSSProperties = {
    display: 'block', // Ensure video behaves like a block element
    width: styleWidth,
    height: styleHeight,
    ...style, // Apply passed-in styles last
  };

  if (isLoading && showLoading) {
    const aspectRatio = (typeof width === 'number' && typeof height === 'number' && height > 0) ? `${width}/${height}` : '16/9';
    return (
      <Skeleton
        className={className}
        style={{ width: styleWidth ?? '100%', height: styleHeight, aspectRatio, ...style }}
      />
    );
  }

  if (hasError || !videoAsset) {
    if (posterUrl) {
      return (
        <NextImage
          src={posterUrl}
          alt={posterAsset?.alt_text ?? `Poster image for ${placeholderId}`}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          style={{ ...combinedStyle, objectFit: 'cover' }} // Use combined style for poster too
          className={className}
        />
      );
    }
    return (
      <div className={`bg-muted text-muted-foreground flex items-center justify-center ${className}`}
           style={{ ...combinedStyle, height: styleHeight ?? '300px' }}> // Ensure height is set
        Video Error
      </div>
    );
  }

  // Render the video element
  return (
    <video
      ref={videoRef}
      className={className}
      width={typeof width === 'number' ? width : undefined}
      height={typeof height === 'number' ? height : undefined}
      style={combinedStyle} // Apply combined style
      poster={posterUrl ?? undefined}
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      playsInline={playsInline}
      controls={controls}
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  );
}
