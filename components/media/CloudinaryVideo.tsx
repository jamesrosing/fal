'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  CloudinaryVideoOptions,
  VideoFormat
} from '@/lib/cloudinary';
import { 
  generateCloudinaryVideoUrl,
  generateVideoPosterUrl,
  isVideoPublicId
} from '@/lib/cloudinary-url';

export interface CloudinaryVideoSourceProps {
  src: string;
  type: string;
  media?: string;
}

export interface CloudinaryVideoProps {
  publicId: string;
  poster?: string;
  options?: CloudinaryVideoOptions;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  className?: string;
  preload?: 'auto' | 'metadata' | 'none';
  onReady?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  formats?: VideoFormat[];
  quality?: number;
  responsive?: boolean;
  widths?: number[];
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
 *   options={{ width: 720 }}
 *   autoPlay
 *   loop
 *   muted
 * />
 */
export function CloudinaryVideo({
  publicId,
  poster,
  options = {},
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  playsInline = true,
  className = "",
  preload = 'auto',
  onReady,
  onEnded,
  onError,
  formats = ['mp4', 'webm'],
  quality = 80,
  responsive = true,
  widths = [480, 720, 1080]
}: CloudinaryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sources, setSources] = useState<CloudinaryVideoSourceProps[]>([]);
  const [posterUrl, setPosterUrl] = useState<string>('');
  
  // Helper function to check if two arrays of sources are equal
  const areSourcesEqual = useCallback((sourcesA: CloudinaryVideoSourceProps[], sourcesB: CloudinaryVideoSourceProps[]) => {
    if (sourcesA.length !== sourcesB.length) return false;
    
    for (let i = 0; i < sourcesA.length; i++) {
      if (sourcesA[i].src !== sourcesB[i].src || 
          sourcesA[i].type !== sourcesB[i].type || 
          sourcesA[i].media !== sourcesB[i].media) {
        return false;
      }
    }
    
    return true;
  }, []);

  // Create stable versions of dependency objects to prevent unnecessary re-renders
  const stableOptions = JSON.stringify(options);
  const stableFormats = JSON.stringify(formats);
  const stableWidths = JSON.stringify(widths);

  // Generate video sources and poster when props change
  useEffect(() => {
    // Reset if no publicId
    if (!publicId) {
      if (sources.length > 0) setSources([]);
      if (posterUrl !== '') setPosterUrl('');
      return;
    }

    try {
      // Validate that this is actually a video
      if (!isVideoPublicId(publicId)) {
        console.warn(`CloudinaryVideo: publicId doesn't appear to be a video: ${publicId}`);
      }

      // Generate sources for all specified formats and widths
      const generatedSources: CloudinaryVideoSourceProps[] = [];
      const parsedFormats: VideoFormat[] = JSON.parse(stableFormats);
      const parsedWidths: number[] = JSON.parse(stableWidths);
      const parsedOptions = JSON.parse(stableOptions);

      // Handle responsive widths
      if (responsive) {
        parsedFormats.forEach(format => {
          parsedWidths.forEach(width => {
            const src = generateCloudinaryVideoUrl(publicId, {
              format,
              quality,
              width
            });

            generatedSources.push({
              src,
              type: `video/${format}`,
              media: width < 640 ? '(max-width: 640px)' : 
                    width < 1024 ? '(max-width: 1024px)' : 
                    width < 1280 ? '(max-width: 1280px)' : 
                    undefined
            });
          });
        });
      } else {
        // Non-responsive, just generate each format
        parsedFormats.forEach(format => {
          const src = generateCloudinaryVideoUrl(publicId, {
            format,
            quality,
            width: parsedOptions.width
          });

          generatedSources.push({
            src,
            type: `video/${format}`
          });
        });
      }

      // Only update sources if they've actually changed
      const sourcesChanged = !areSourcesEqual(generatedSources, sources);
      if (sourcesChanged) {
        setSources(generatedSources);
      }

      // Generate poster image if not explicitly provided
      let newPosterUrl: string;
      if (!poster) {
        newPosterUrl = generateVideoPosterUrl(publicId, {
          format: 'jpg',
          quality: 80,
          width: Math.max(...parsedWidths)
        });
      } else {
        newPosterUrl = poster;
      }

      // Only update poster if it's changed
      if (newPosterUrl !== posterUrl) {
        setPosterUrl(newPosterUrl);
      }
    } catch (err) {
      console.error('Error generating Cloudinary video sources:', err);
      setError(true);
      if (onError) onError();
    }
  }, [publicId, poster, stableOptions, stableFormats, quality, responsive, stableWidths, areSourcesEqual, sources, posterUrl]);

  // Handle video load event
  const handleCanPlay = () => {
    setIsLoaded(true);
    if (onReady) onReady();
  };

  // Handle video error
  const handleError = () => {
    console.error(`CloudinaryVideo: Error loading video: ${publicId}`);
    setError(true);
    if (onError) onError();
  };

  // If loading, display placeholder
  if (!isLoaded && !error) {
    return (
      <div 
        className={`cloudinary-video-loading ${className}`}
        style={{ 
          position: 'relative',
          backgroundColor: '#f0f0f0',
          width: options.width || '100%',
          aspectRatio: '16/9'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // If error, show error placeholder
  if (error) {
    return (
      <div 
        className={`cloudinary-video-error ${className}`}
        style={{ 
          backgroundColor: '#fef2f2', 
          borderColor: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: '0.25rem',
          width: options.width || '100%',
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        Video could not be loaded
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      poster={posterUrl}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline={playsInline}
      className={`cloudinary-video ${className}`}
      onCanPlay={handleCanPlay}
      onError={handleError}
      onEnded={onEnded}
      preload={preload}
    >
      {sources.map((source, index) => (
        <source 
          key={`${source.type}-${source.media || 'default'}-${index}`} 
          src={source.src} 
          type={source.type} 
          media={source.media} 
        />
      ))}
      Your browser does not support the video tag.
    </video>
  );
}

export default CloudinaryVideo; 