"use client"

import { useState } from "react"
import ImageUploader from "./components/image-uploader"
import ImageDisplay from "./components/image-display"

interface ProcessedImage {
  url: string;
  format: string;
}

export default function Home() {
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)

  const handleImageProcessed = (url: string, format: string) => {
    setProcessedImage({ url, format })
  }

  return (
    <div className="flex gap-8">
      <div className="w-1/2">
        <ImageUploader onImageProcessed={handleImageProcessed} />
      </div>
      <div className="w-1/2">
        <ImageDisplay 
          imageUrl={processedImage?.url ?? null} 
          format={processedImage?.format}
        />
      </div>
    </div>
  )
}

