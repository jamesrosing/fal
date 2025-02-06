"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CaseViewerProps {
  images: Array<{
    id: string
    url: string
  }>
}

export function CaseViewer({ images }: CaseViewerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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
      <div className="relative aspect-[16/9] bg-black/10 rounded-lg overflow-hidden">
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
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next image</span>
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            className={`relative aspect-square overflow-hidden rounded-lg transition-all ${
              i === currentIndex ? "ring-2 ring-primary" : "opacity-50 hover:opacity-75"
            }`}
            onClick={() => setCurrentIndex(i)}
          >
            <img src={image.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

