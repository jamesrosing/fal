"use client"

import { useEffect, useRef } from "react"

interface VideoLoaderProps {
  src: string
  onLoad: () => void
}

export function VideoLoader({ src, onLoad }: VideoLoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener("loadeddata", onLoad)
      return () => {
        video.removeEventListener("loadeddata", onLoad)
      }
    }
  }, [onLoad])

  return (
    <video
      ref={videoRef}
      src={src}
      className="hidden"
      preload="auto"
    />
  )
}

