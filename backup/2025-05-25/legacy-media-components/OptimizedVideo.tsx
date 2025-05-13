"use client";

import React, { useRef, useEffect, useState } from 'react';
import { getVideoSources } from '@/lib/media/utils';
import { VideoOptions } from '@/lib/media/types';
import { CldImage } from '../components/media/CldImage';

interface OptimizedVideoProps {
  id: string;
  options?: VideoOptions;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  poster?: string;
}

export default function OptimizedVideo({
  id,
  options = {},
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  playsInline = true,
  poster,
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get video sources for different formats/resolutions
  const sources = getVideoSources(id, {
    formats: ['mp4', 'webm'],
    widths: [480, 720, 1080],
    baseOptions: options
  });
  
  // Handle video errors
  const handleError = () => {
    setIsError(true);
    console.error('Error loading video:', id);
  };
  
  // Handle video loaded
  const handleLoaded = () => {
    setIsLoaded(true);
  };
  
  // Auto-play video when in viewport
  useEffect(() => {
    if (!videoRef.current || !autoPlay) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.warn('Auto-play prevented:', err);
            });
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(videoRef.current);
    
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [autoPlay, isLoaded]);
  
  return (
    <div className={`video-wrapper ${className} ${isError ? 'error' : ''}`}>
      {isError ? (
        <div className="video-error">
          <p>Video could not be loaded</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className={`optimized-video ${isLoaded ? 'loaded' : 'loading'}`}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline={playsInline}
            onError={handleError}
            onLoadedData={handleLoaded}
            poster={poster}
          >
            {sources.map((source, index) => (
              <source key={index} src={source.src} type={source.type} media={source.media} />
            ))}
            Your browser does not support the video tag.
          </video>
          {!isLoaded && <div className="video-loading">Loading...</div>}
        </>
      )}
    </div>
  );
}