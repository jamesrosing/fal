"use client"

import { useState } from "react"
import ImageUploader from "./image-uploader"
import ImageDisplay from "./image-display"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


interface ProcessedImage {
  url: string;
  format: string;
}

export default function BackgroundRemover() {
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)

  const handleImageProcessed = (url: string, format: string) => {
    setProcessedImage({ url, format })
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Background Removal Tool</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
                <ImageUploader onImageProcessed={handleImageProcessed} />
              </div>
            </div>
            <div>
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <ImageDisplay 
                  imageUrl={processedImage?.url ?? null} 
                  format={processedImage?.format}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 