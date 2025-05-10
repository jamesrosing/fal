'use client';

import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css'
import { useState } from 'react';

export interface CldVideoWrapperProps {
  publicId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  poster?: string;
  onError?: () => void;
  onEnded?: () => void;
  fallbackSrc?: string;
}

export function CldVideoWrapper({
  publicId,
  width = 'auto',
  height = 'auto',
  autoplay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
  poster,
  onError,
  onEnded,
  fallbackSrc,
}: CldVideoWrapperProps) {
  const [error, setError] = useState(false);

  // Handle missing publicId or errors
  if (!publicId || error) {
    if (fallbackSrc) {
      return (
        <video
          src={fallbackSrc}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          style={{ 
            width: typeof width === 'string' ? width : undefined,
            height: typeof height === 'string' ? height : undefined
          }}
          autoplay ={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          className={className}
          onEnded={onEnded}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return (
      <div 
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          aspectRatio: '16/9'
        }}
      />
    );
  }

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <CldVideoPlayer
      id={`video-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`}
      width={width}
      height={height}
      src={publicId}
      className={className}
      autoplay ={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      onError={handleError}
      onEnded={onEnded}
    />
  );
}

export default CldVideoWrapper; 

