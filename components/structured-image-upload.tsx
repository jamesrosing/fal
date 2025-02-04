"use client"

import { useState } from "react"
import { Upload, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageArea, IMAGE_PLACEMENTS } from "@/lib/cloudinary"
import { resizeImage } from "@/lib/utils"

interface StructuredImageUploadProps {
  defaultArea?: ImageArea;
  defaultSection?: string;
  onUploadComplete: (result: {
    url: string;
    public_id: string;
    metadata: {
      width: number;
      height: number;
      format: string;
      resource_type: string;
    };
  }) => void;
}

export function StructuredImageUpload({
  defaultArea,
  defaultSection = "",
  onUploadComplete
}: StructuredImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [area, setArea] = useState<ImageArea | "">(defaultArea || "")
  const [section, setSection] = useState(defaultSection)
  const [filename, setFilename] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const placement = area ? IMAGE_PLACEMENTS[area] : null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setFile(file)
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Generate clean filename from original
      const cleanFilename = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFilename(cleanFilename)
    } catch (error) {
      console.error("Error handling file:", error)
      setError("Error processing file")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || !area) return

    setIsUploading(true)
    setError(null)

    try {
      // Resize image based on placement dimensions if needed
      const placement = IMAGE_PLACEMENTS[area]
      const maxDimension = Math.max(placement.dimensions.width, placement.dimensions.height)
      const resizedBlob = await resizeImage(file, maxDimension)
      const resizedFile = new File([resizedBlob], file.name, {
        type: "image/jpeg",
      })

      const formData = new FormData()
      formData.append("file", resizedFile)
      formData.append("area", area)
      if (section) {
        formData.append("section", section)
      }
      if (filename) {
        formData.append("filename", filename)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const result = await response.json()
      if (result.success) {
        onUploadComplete(result)
        // Reset form
        setFile(null)
        setPreview(null)
        setFilename("")
        if (!defaultArea) {
          setArea("")
        }
        if (!defaultSection) {
          setSection("")
        }
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setError(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Image Area</Label>
          <Select
            value={area}
            onValueChange={(value) => setArea(value as ImageArea)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select image area" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(IMAGE_PLACEMENTS).map(([key, placement]) => (
                <SelectItem key={key} value={key}>
                  {placement.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {placement && (
          <div className="bg-black/20 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{placement.description}</p>
                <p className="text-gray-400 mt-1">
                  Recommended size: {placement.dimensions.width}x{placement.dimensions.height}px
                  {placement.dimensions.aspectRatio ? ` (${placement.dimensions.aspectRatio}:1)` : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="section">Section (Optional)</Label>
          <Input
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., plastic-surgery, dermatology"
          />
        </div>

        <div>
          <Label htmlFor="filename">Custom Filename (Optional)</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="custom-filename"
          />
        </div>

        <div>
          <Label htmlFor="image">Upload Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {preview && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="object-cover"
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!file || !area || isUploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Image"}
      </Button>
    </form>
  )
} 