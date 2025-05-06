import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import UnifiedMedia from '@/components/media/UnifiedMedia'

interface BackgroundVideoProps {
  poster: string;
  fallbackImage: string;
  sources?: {
    src: string;
    type: string;
    media?: string;
  }[];
  videoId?: string; // Optional videoId for backward compatibility
  className?: string; // Optional className for styling
}

export function BackgroundVideo({ 
  poster, 
  fallbackImage, 
  sources,
  videoId,
  className 
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string>("")

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // When videoId is provided, use that directly with UnifiedMedia
  if (videoId) {
    return (
      <div className="absolute inset-0">
        <UnifiedMedia
          placeholderId={videoId}
          mediaType="video"
          fill
          className={className || "object-cover w-full h-full"}
          autoPlay
          muted
          loop
          fallbackSrc={fallbackImage}
          showLoading={true}
          alt="Background video"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  // When sources are provided, use the first source with UnifiedMedia
  if (sources && sources.length > 0) {
    // Extract the first source
    const primarySource = sources[0];
    
    return (
      <div className="absolute inset-0">
        <UnifiedMedia
          src={primarySource.src}
          mediaType={primarySource.type.startsWith('video/') ? 'video' : 'image'}
          fill
          className={className || "object-cover w-full h-full"}
          autoPlay
          muted
          loop
          fallbackSrc={fallbackImage}
          showLoading={true}
          alt="Background media"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  // Fallback to image if no video sources
  return (
    <div className="absolute inset-0">
      <UnifiedMedia
        src={fallbackImage}
        alt="Background"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
} 