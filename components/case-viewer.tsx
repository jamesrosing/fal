"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CaseImage {
  id: string
  url: string
}

interface CaseViewerProps {
  images: CaseImage[]
  initialImageId?: string
}

export function CaseViewer({ images, initialImageId }: CaseViewerProps) {
  const router = useRouter()
  const [selectedImageId, setSelectedImageId] = React.useState(initialImageId || images[0].id)
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)

  const selectedImageIndex = images.findIndex((img) => img.id === selectedImageId)
  const selectedImage = images[selectedImageIndex]

  const handlePrevious = () => {
    const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
    setSelectedImageId(images[newIndex].id)
  }

  const handleNext = () => {
    const newIndex = selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
    setSelectedImageId(images[newIndex].id)
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "Escape") setIsLightboxOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLightboxOpen, selectedImageIndex])

  return (
    <div className="w-full space-y-4">
      {/* Main Image with Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <Button variant="ghost" className="w-full p-0 h-auto hover:opacity-90" onClick={() => setIsLightboxOpen(true)}>
          <img
            src={selectedImage.url || "/placeholder.svg"}
            alt={`Case Image ${selectedImageId}`}
            className="w-full h-[600px] object-cover rounded-lg"
          />
        </Button>
        <DialogContent className="max-w-7xl bg-black/95 border-none p-0 gap-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsLightboxOpen(false)}
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
            <span className="text-white text-sm">
              {selectedImageIndex + 1} of {images.length}
            </span>
          </div>

          {/* Image Container */}
          <div className="relative flex items-center justify-center h-[calc(100vh-4rem)] md:h-[80vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous image</span>
            </Button>
            <img
              src={selectedImage.url || "/placeholder.svg"}
              alt={`Case Image ${selectedImageId}`}
              className="max-h-full max-w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Carousel */}
      <div className="relative overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageId(image.id)}
              className={cn(
                "relative flex-shrink-0 cursor-pointer transition-opacity",
                image.id === selectedImageId ? "opacity-100" : "opacity-50 hover:opacity-75",
              )}
            >
              <img
                src={image.url || "/placeholder.svg"}
                alt={`Thumbnail ${image.id}`}
                className="h-20 w-32 object-cover rounded-md"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

