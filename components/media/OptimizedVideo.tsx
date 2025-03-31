import React, { useRef, useEffect, useState } from 'react';
import { getVideoSources, getMediaUrl } from '@/lib/media/utils';
import Image from 'next/image';
import { VideoOptions } from '@/lib/media/types';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface OptimizedVideoProps {
  id: string;
  options?: VideoOptions;
  className?: string;
  fallbackImageId?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedVideo({
  id,
  options = {},
  className = '',
  fallbackImageId,
  onLoad,
  onError
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Default options
  const {
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    poster = '',
    format = 'mp4',
    quality = 80,
    width = 1080,
  } = options;
  
  // Get video sources
  const sources = getVideoSources(id, {
    formats: ['mp4', 'webm'],
    widths: [480, 720, 1080],
    baseOptions: options
  });
  
  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Setup video events
  useEffect(() => {
    if (!isMounted) return;
    
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
  }, [isMounted, id, autoPlay, onLoad, onError]);
  
  // Fallback image if video has error or isn't loaded yet
  const showFallback = (!isLoaded || hasError) && fallbackImageId;
  
  // Get poster URL if provided
  const posterUrl = poster ? getMediaUrl(poster, { 
    width: Math.min(width, 1920),
    quality: 80
  }) : undefined;
  
  return (
    <div className="relative overflow-hidden">
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
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} media={source.media} />
        ))}
        Your browser does not support the video tag.
      </video>
      
      {/* Fallback/poster image */}
      {showFallback && fallbackImageId && (
        <div className="absolute inset-0 z-10">
          <Image
            src={getMediaUrl(fallbackImageId)}
            alt="Video fallback"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
} 