"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { processImage } from "../actions"
import { resizeImage } from "@/lib/utils"

interface ImageUploaderProps {
  onImageProcessed: (url: string) => void;
}

export default function ImageUploader({ onImageProcessed }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    try {
      // Resize image on the client side
      const resizedBlob = await resizeImage(file, 1024)
      const resizedFile = new File([resizedBlob], file.name, {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("image", resizedFile)
      const result = await processImage(formData)
      
      if (result.success && result.url) {
        onImageProcessed(result.url)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="image">Upload Image</Label>
        <Input 
          id="image" 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
      </div>
      <Button type="submit" disabled={!file || isUploading}>
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Processing..." : "Process Image"}
      </Button>
    </form>
  )
}

