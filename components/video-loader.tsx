"use client"

import { useEffect, useState } from "react"

interface VideoLoaderProps {
  src: string
  onLoad: () => void
}

export function VideoLoader({ src, onLoad }: VideoLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const video = document.createElement("video")

    video.addEventListener("loadedmetadata", () => {
      setIsLoading(false)
      onLoad()
    })

    video.src = src

    return () => {
      video.remove()
    }
  }, [src, onLoad])

  return null
}

