"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface ImageDisplayProps {
  imageUrl: string | null;
  format?: string;
}

export default function ImageDisplay({ imageUrl, format = "png" }: ImageDisplayProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handleDownload = async () => {
    if (!imageUrl) return
    
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Use the correct extension based on the format
      const extension = format === "jpeg" ? "jpg" : format
      a.download = `processed-image.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
    // Prevent scrolling when in full-screen
    document.body.style.overflow = !isFullScreen ? 'hidden' : 'auto'
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">No processed image to display</p>
      </div>
    )
  }

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleDownload}
            title="Download Image"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullScreen}
            title="Exit Full Screen"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative w-full h-full p-4">
          <Image 
            src={imageUrl} 
            alt="Processed Image" 
            fill
            style={{ objectFit: "contain" }}
            sizes="100vw"
            priority
            quality={90}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-square w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleDownload}
          title="Download Image"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleFullScreen}
          title="Full Screen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative w-full h-full">
        <Image 
          src={imageUrl} 
          alt="Processed Image" 
          fill
          style={{ objectFit: "contain" }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          quality={90}
        />
      </div>
    </div>
  )
}

