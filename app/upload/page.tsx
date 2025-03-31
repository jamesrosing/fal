"use client"

import { useState } from "react"
import ImageUploader from "@/components/image-uploader"
import ImageDisplay from "@/components/image-display"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export default function UploadPage() {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [imageFormat, setImageFormat] = useState<string>("webp")

  const handleImageProcessed = (url: string, format: string) => {
    setProcessedImageUrl(url)
    setImageFormat(format)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-8">Upload Image</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <ImageUploader onImageProcessed={handleImageProcessed} />
        <ImageDisplay imageUrl={processedImageUrl} format={imageFormat} />

      </div>
    </div>
  )
} 