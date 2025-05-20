"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';

interface MediaItem {
  id: string
  url: string
  type?: 'image' | 'video'
}

interface CaseViewerProps {
  images: MediaItem[]
}

export function CaseViewer({ images }: CaseViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  // Process media items to determine their types if not explicitly provided
  const mediaItems = React.useMemo(() => {
    return images.map(item => {
      if (item.type) return item;
      
      // Detect type based on URL if not provided
      const isVideo = item.url.includes('.mp4') || 
                     item.url.includes('.mov') || 
                     item.url.includes('.webm') || 
                     item.url.toLowerCase().includes('/video/');
      
      return {
        ...item,
        type: isVideo ? 'video' : 'image'
      };
    });
  }, [images]);

  const handlePrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
    setIsLoading(true)
  }, [mediaItems.length])

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
    setIsLoading(true)
  }, [mediaItems.length])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePrevious, handleNext])

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-black/10 rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  const currentMedia = mediaItems[currentIndex];
  const isVideo = currentMedia.type === 'video';

  // Extract Cloudinary public ID from URL for videos
  const getPublicIdFromUrl = (url: string) => {
    // Remove any query parameters
    const urlWithoutParams = url.split('?')[0];
    // Get everything after /upload/
    const match = urlWithoutParams.match(/\/upload\/(.+)$/);
    return match ? match[1] : url;
  };

  return (
    <div className="space-y-6">
      {/* Main Media Item (Image or Video) */}
      <div className="relative aspect-[4/3] bg-zinc-900 rounded-lg overflow-hidden">
        {isVideo ? (
          <CldVideo
            publicId={getPublicIdFromUrl(currentMedia.url)}
            controls
            autoplay={false}
            className="w-full h-full object-contain"
            onPlay={() => setIsLoading(false)}
            fill
          />
        ) : (
          <CldImage
            src={currentMedia.url}
            alt={`Case image ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            showLoading={false}
            fill
          />
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-8 w-8" />
          <span className="sr-only">Previous image</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors"
          onClick={handleNext}
        >
          <ChevronRight className="h-8 w-8" />
          <span className="sr-only">Next image</span>
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {mediaItems.map((media, i) => (
          <button
            key={media.id}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-lg transition-all",
              i === currentIndex 
                ? "ring-2 ring-white" 
                : "opacity-50 hover:opacity-75"
            )}
            onClick={() => {
              setCurrentIndex(i)
              setIsLoading(true)
            }}
          >
            {media.type === 'video' ? (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative">
                <CldImage
                  src={media.url.replace(/\.(mp4|mov|webm)$/, '.jpg')}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  fill
                  fallbackSrc="/placeholder.svg?height=80&width=120&text=Video"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                  </div>
                </div>
              </div>
            ) : (
              <CldImage 
                src={media.url} 
                alt={`Thumbnail ${i + 1}`} 
                className="w-full h-full object-cover"
                fill
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

