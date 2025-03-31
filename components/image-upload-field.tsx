"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type ImageArea, getImageProps, IMAGE_SIZES, IMAGE_PLACEMENTS } from "@/lib/image-utils"
import { resizeImage } from "@/lib/utils"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface ImageUploadFieldProps {
  area: ImageArea;
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  filename?: string;
}

export default function ImageUploadField({
  area,
  onImageUploaded,
  currentImageUrl,
  label = "Upload Image",
  filename
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const [customFilename, setCustomFilename] = useState(filename || "")

  const placement = IMAGE_PLACEMENTS[area]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setIsUploading(true)
    setError(null)

    try {
      // Resize image on the client side
      const resizedBlob = await resizeImage(file, 2048)
      const resizedFile = new File([resizedBlob], customFilename || file.name, {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("file", resizedFile)
      formData.append("area", area)
      formData.append("path", placement.path)
      if (customFilename) {
        formData.append("filename", customFilename)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      if (data.success && data.url) {
        onImageUploaded(data.url)
        setPreviewUrl(data.url)
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Failed to upload image")
      // Reset preview if upload failed
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const imageProps = getImageProps(area, {
    src: previewUrl || "",
    alt: "Preview",
    sizes: IMAGE_SIZES[area]
  })

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-4 rounded-lg space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{placement.description}</p>
            <p className="text-gray-400 mt-1">Recommended size: {placement.dimensions}</p>
            <p className="text-gray-400">Example: {placement.example}</p>
          </div>
        </div>
      </div>

      {filename && (
        <div>
          <Label htmlFor={`filename-${area}`}>Filename</Label>
          <Input
            id={`filename-${area}`}
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            placeholder="Enter specific filename (optional)"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor={`image-${area}`}>{label}</Label>
        <Input
          id={`image-${area}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {previewUrl && (
        <div className="relative aspect-[16/9]">
          <Image
            {...imageProps}
            alt="Preview"
            className={`${imageProps.className} rounded-lg`}
          />
        </div>
      )}

      {isUploading && (
        <Button disabled className="w-full">
          <Upload className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </Button>
      )}
    </div>
  )
} 