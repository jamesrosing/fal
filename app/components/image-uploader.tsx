"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { processImage } from "../actions"
import { resizeImage } from "@/lib/utils"

type OutputFormat = "png" | "jpg" | "jpeg"

interface ImageUploaderProps {
  onImageProcessed: (url: string, format: string) => void;
}

export default function ImageUploader({ onImageProcessed }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Validate background color
      if (!backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)) {
        throw new Error("Invalid background color format. Please use hex format (e.g., #ffffff)")
      }

      // Resize image on the client side
      const resizedBlob = await resizeImage(file, 1024)
      const resizedFile = new File([resizedBlob], file.name, {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("image", resizedFile)
      formData.append("backgroundColor", backgroundColor)
      formData.append("outputFormat", outputFormat)

      console.log("Submitting form data:", {
        fileName: resizedFile.name,
        fileSize: resizedFile.size,
        backgroundColor,
        outputFormat
      })

      const result = await processImage(formData)
      
      if (result.success && result.url) {
        onImageProcessed(result.url, result.format || outputFormat)
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Failed to process image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleBackgroundColorChange = (value: string) => {
    // Ensure the color always has a # prefix
    const color = value.startsWith("#") ? value : `#${value}`
    setBackgroundColor(color)
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
      <div>
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex gap-2">
          <Input 
            id="backgroundColor"
            type="color"
            value={backgroundColor}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="w-20 h-10 p-1"
            disabled={isUploading}
          />
          <Input 
            type="text"
            value={backgroundColor}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            placeholder="#ffffff"
            className="flex-1"
            disabled={isUploading}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="outputFormat">Output Format</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={outputFormat === "png" ? "default" : "outline"}
            onClick={() => setOutputFormat("png")}
            disabled={isUploading}
            className="w-full"
          >
            PNG
          </Button>
          <Button
            type="button"
            variant={outputFormat === "jpg" ? "default" : "outline"}
            onClick={() => setOutputFormat("jpg")}
            disabled={isUploading}
            className="w-full"
          >
            JPG
          </Button>
          <Button
            type="button"
            variant={outputFormat === "jpeg" ? "default" : "outline"}
            onClick={() => setOutputFormat("jpeg")}
            disabled={isUploading}
            className="w-full"
          >
            JPEG
          </Button>
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" disabled={!file || isUploading}>
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Processing..." : "Process Image"}
      </Button>
    </form>
  )
}

