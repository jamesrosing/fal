"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { ImageArea, IMAGE_PLACEMENTS } from "@/lib/cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface StructuredImageUploadProps {
  defaultArea?: ImageArea
  defaultSection?: string
  onUploadComplete: (result: {
    url: string
    public_id: string
    metadata: {
      width: number
      height: number
      format: string
      resource_type: string
    }
  }) => void
}

export function StructuredImageUpload({
  defaultArea,
  defaultSection,
  onUploadComplete
}: StructuredImageUploadProps) {
  const [selectedArea, setSelectedArea] = useState<ImageArea>(defaultArea || "hero")
  const [section, setSection] = useState(defaultSection || "")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      setProgress(0)
      setError(null)

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("area", selectedArea)
      if (section) formData.append("section", section)

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Upload failed")
        }

        const result = await response.json()
        onUploadComplete(result)
        setProgress(100)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    accept: {
      "image/*": []
    },
    maxFiles: 1
  })

  const placement = IMAGE_PLACEMENTS[selectedArea]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="area">Image Area</Label>
          <Select
            value={selectedArea}
            onValueChange={(value) => setSelectedArea(value as ImageArea)}
          >
            <SelectTrigger id="area">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(IMAGE_PLACEMENTS).map(([area, config]) => (
                <SelectItem key={area} value={area}>
                  {config.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="section">Section (Optional)</Label>
          <Input
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g., plastic-surgery"
          />
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
        <p><strong>Recommended Size:</strong> {placement.dimensions.width}x{placement.dimensions.height}px</p>
        <p><strong>Aspect Ratio:</strong> {placement.dimensions.aspectRatio}:1</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here</p>
        ) : (
          <p>Drag &apos;n&apos; drop an image here, or click to select</p>
        )}
      </div>

      {uploading && (
        <Progress value={progress} className="w-full" />
      )}

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  )
} 