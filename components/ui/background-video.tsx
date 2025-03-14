import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Head from "next/head"

interface BackgroundVideoProps {
  poster: string;
  fallbackImage: string;
  sources: {
    src: string;
    type: string;
    media?: string;
  }[];
}

export function BackgroundVideo({ poster, fallbackImage, sources }: BackgroundVideoProps) {
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

  useEffect(() => {
    if (!isMounted) return

    console.log("Video sources:", sources)
    const video = videoRef.current
    if (!video) return

    const handleLoad = () => {
      console.log("Video loaded successfully")
      setIsVideoLoaded(true)
    }

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement
      console.error("Video error:", {
        event: e,
        currentSrc: videoElement.currentSrc,
        networkState: videoElement.networkState,
        readyState: videoElement.readyState,
        errorMessage: videoElement.error?.message
      })
      setErrorDetails(
        `Error loading video: ${videoElement.error?.message || 'Unknown error'} ` +
        `(Network state: ${videoElement.networkState}, Ready state: ${videoElement.readyState})`
      )
      setHasError(true)
    }

    const handleLoadStart = () => console.log("Video load started")
    const handleProgress = () => console.log("Video loading in progress")
    const handleCanPlay = () => console.log("Video can start playing")
    const handleCanPlayThrough = () => console.log("Video can play through")

    // Add all event listeners
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("progress", handleProgress)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("canplaythrough", handleCanPlayThrough)
    video.addEventListener("loadeddata", handleLoad)
    video.addEventListener("error", handleError)

    // Start loading the video
    video.load()

    // Attempt to play when ready
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Video autoplay failed:", error)
        setErrorDetails(`Autoplay failed: ${error.message}`)
      })
    }

    return () => {
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("progress", handleProgress)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
      video.removeEventListener("loadeddata", handleLoad)
      video.removeEventListener("error", handleError)
    }
  }, [isMounted, sources])

  // Show static image for SSR and if video fails
  if (!isMounted || hasError) {
    return (
      <div className="absolute inset-0">
        {fallbackImage && (
          <Image
            src={fallbackImage}
            alt="Background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        {errorDetails && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/80 text-white p-2 rounded text-sm">
            {errorDetails}
          </div>
        )}
      </div>
    )
  }

  // Only render preload links if we have valid URLs
  const hasValidPoster = poster && poster.trim() !== '';
  const validSources = sources?.filter(source => source.src && source.src.trim() !== '') || [];

  return (
    <>
      {isMounted && (
        <Head>
          {hasValidPoster && (
            <link rel="preload" as="image" href={poster} />
          )}
          {validSources.map((source, index) => (
            source.src && <link key={index} rel="preload" as="video" href={source.src} />
          ))}
        </Head>
      )}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          {sources.map((source, index) => (
            source.src && <source key={index} {...source} />
          ))}
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Show poster while video loads */}
        {!isVideoLoaded && poster && (
          <Image
            src={poster}
            alt="Video poster"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
      </div>
    </>
  )
} 