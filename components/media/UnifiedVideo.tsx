'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { mediaService, VideoOptions } from '@/lib/services/media-service';
import { Skeleton } from "@/components/ui/skeleton";

interface UnifiedVideoProps {
  placeholderId: string;
  options?: VideoOptions;
  className?: string;
  posterPlaceholderId?: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  showLoading?: boolean;
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
  fallbackSrc,
  width,
  height,
  onLoad,
  onError,
  showLoading = true
}: UnifiedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [asset, setAsset] = useState<any>(null);
  const [posterAsset, setPosterAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Default options
  const {
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
  } = options;
  
  // Fetch video and poster assets
  useEffect(() => {
    let isMounted = true;
    
    async function loadAssets() {
      try {
        setLoading(true);
        
        // Load video asset
        const videoAsset = await mediaService.getMediaByPlaceholderId(placeholderId);
        
        // Load poster asset if provided
        let posterResult = null;
        if (posterPlaceholderId) {
          posterResult = await mediaService.getMediaByPlaceholderId(posterPlaceholderId);
        }
        
        if (isMounted) {
          setAsset(videoAsset);
          if (posterResult) setPosterAsset(posterResult);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error loading video for ${placeholderId}:`, err);
        if (isMounted) {
          setHasError(true);
          setLoading(false);
        }
      }
    }
    
    loadAssets();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId, posterPlaceholderId]);
  
  // Setup video events
  useEffect(() => {
    if (loading || !asset) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    
    const handleError = () => {
      setHasError(true);
      onError?.();
    };
    
    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('error', handleError);
    
    // Try to play the video
    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay prevented:', error);
        });
      }
    }
    
    return () => {
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('error', handleError);
    };
  }, [loading, asset, autoPlay, onLoad, onError]);
  
  // Handle loading state
  if (loading && showLoading) {
    return (
      <Skeleton 
        className="rounded overflow-hidden" 
        style={{ 
          width: width || '100%', 
          height: height || 'auto', 
          aspectRatio: width && height ? width / height : 16/9 
        }}
      />
    );
  }
  
  // Handle error state or missing asset
  if (hasError || !asset) {
    if (fallbackSrc) {
      return (
        <Image 
          src={fallbackSrc}
          alt="Video thumbnail"
          width={width || 800}
          height={height || 450}
          className={className}
        />
      );
    }
    return null;
  }
  
  // Get all video sources for different formats/resolutions
  const videoSources = mediaService.getVideoSources(asset, options);
  
  // Get poster URL if available
  const posterUrl = posterAsset ? mediaService.getMediaUrl(posterAsset) : undefined;
  
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        poster={posterUrl}
      >
        {videoSources.map((source, index) => (
          <source 
            key={index} 
            src={source.src} 
            type={source.type} 
          />
        ))}
        Your browser does not support the video tag.
      </video>
      
      {/* Poster/fallback image while video loads */}
      {!isLoaded && posterUrl && (
        <div className="absolute inset-0 z-10">
          <Image
            src={posterUrl}
            alt="Video poster"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
