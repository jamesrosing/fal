"use client"

import { useState } from "react"
import ImageUploader from "./components/image-uploader"
import ImageDisplay from "./components/image-display"

export default function Home() {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)

  return (
    <div className="flex gap-8">
      <div className="w-1/2">
        <ImageUploader onImageProcessed={setProcessedImageUrl} />
      </div>
      <div className="w-1/2">
        <ImageDisplay imageUrl={processedImageUrl} />
      </div>
    </div>
  )
}

