"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/app/actions"
// import OptimizedImage from '@/components/media/OptimizedImage';
// import OptimizedVideo from '@/components/media/OptimizedVideo';


interface VBlobImageUploaderProps {
  onImageUploaded: (url: string) => void;
}

export default function VBlobImageUploader({ onImageUploaded }: VBlobImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const url = await uploadImage(formData)
      onImageUploaded(url)
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="image">Upload Image to Vercel Blob</Label>
        <Input 
          id="image" 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" disabled={!file || isUploading}>
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload to Blob"}
      </Button>
    </form>
  )
} 