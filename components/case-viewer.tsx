"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface CaseViewerProps {
  images: Array<{
    id: string
    url: string
  }>
}

export function CaseViewer({ images }: CaseViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const handlePrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlePrevious, handleNext])

  // Reset loading state when image changes
  React.useEffect(() => {
    setIsLoading(true)
  }, [currentIndex])

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-black/10 rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-zinc-900 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex].url}
          alt={`Case image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
        />
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
        {images.map((image, i) => (
          <button
            key={image.id}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-lg transition-all",
              i === currentIndex 
                ? "ring-2 ring-white" 
                : "opacity-50 hover:opacity-75"
            )}
            onClick={() => setCurrentIndex(i)}
          >
            <img 
              src={image.url} 
              alt={`Thumbnail ${i + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

