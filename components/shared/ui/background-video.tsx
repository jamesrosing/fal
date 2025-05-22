import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import CldImage from '@/components/media/CldImage'
import CldVideo from '@/components/media/CldVideo'
import Image from 'next/image'

interface BackgroundVideoProps {
  poster?: string;
  fallbackImage: string;
  sources?: {
    src: string;
    type: string;
    media?: string;
  }[];
  videoId?: string; // Optional videoId for backward compatibility
  className?: string; // Optional className for styling
  publicId?: string; // Added Cloudinary publicId
}

export function BackgroundVideo({ 
  poster, 
  fallbackImage, 
  sources,
  videoId,
  className,
  publicId
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

  // When publicId is provided, use that directly with Cloudinary components
  if (publicId) {
    // Determine if it's video or image based on the public_id path or extension
    const isVideo = publicId.includes('/video/') || /\.(mp4|webm|ogv|mov)$/i.test(publicId);
    
    if (isVideo) {
      return (
        <div className="absolute inset-0">
          <CldVideo src={publicId}
            className={className || "object-cover w-full h-full"}
            autoPlay
            muted
            loop
            alt="Background video"
          / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
          <div className="absolute inset-0 bg-black/30" />
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0">
          <CldImage src={publicId}
            alt="Background image"
            width={1920}
            height={1080}
            className={className || "object-cover w-full h-full"}
            sizes="100vw"
            priority
          / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
          <div className="absolute inset-0 bg-black/30" />
        </div>
      );
    }
  }

  // When videoId is provided, fallback to image since we don't use placeholderIds anymore
  if (videoId) {
    console.warn('Using videoId is deprecated. Please use publicId instead.');
    return (
      <div className="absolute inset-0">
        <Image
          src={fallbackImage}
          alt="Background image"
          fill
          className={className || "object-cover w-full h-full"}
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    );
  }

  // When sources are provided, use the first source
  if (sources && sources.length > 0) {
    // Extract the first source
    const primarySource = sources[0];
    const isVideo = primarySource.type.startsWith('video/');
    
    if (isVideo) {
      return (
        <div className="absolute inset-0">
          <video
            src={primarySource.src}
            className={className || "object-cover w-full h-full absolute inset-0"}
            autoPlay
            muted
            loop
            poster={poster}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0">
          <Image
            src={primarySource.src}
            alt="Background media"
            fill
            className={className || "object-cover w-full h-full"}
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      );
    }
  }

  // Fallback to image if no video sources
  return (
    <div className="absolute inset-0">
      <Image
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