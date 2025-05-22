"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { ImageArea, uploadToCloudinary } from "@/lib/cloudinary"
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select'
import { Progress } from '@/components/shared/ui/progress'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


interface ImageAssetUploadProps {
  assetId?: string
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
      context: {
        area: string
        section: string
        dimensions: string
        aspect_ratio: string
      }
    }
  }) => void
}

export function ImageAssetUpload({
  assetId,
  defaultArea = "gallery",
  defaultSection,
  onUploadComplete
}: ImageAssetUploadProps) {
  const [selectedArea, setSelectedArea] = useState<ImageArea>(defaultArea)
  const [section, setSection] = useState(defaultSection || "")
  const [assetName, setAssetName] = useState(assetId || "")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        const file = acceptedFiles[0]
        
        // Use the provided asset ID or generate a clean filename
        const cleanFilename = assetId || assetName 
          ? (assetId || assetName).toLowerCase().replace(/[^a-z0-9-]+/g, '-')
          : file.name.toLowerCase()
            .replace(/\.[^/.]+$/, '') // Remove extension
            .replace(/[^a-z0-9-]+/g, '-')
        
        // For team member images, ensure we use the correct folder structure
        const finalSection = selectedArea === 'team' ? 'headshots' : section
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file,
          selectedArea,
          finalSection,
          cleanFilename
        )

        // Ensure metadata context exists
        if (!result.metadata) {
          result.metadata = {
            width: 0,
            height: 0,
            format: '',
            resource_type: 'image',
            context: {
              area: selectedArea,
              section: finalSection,
              dimensions: '',
              aspect_ratio: ''
            }
          }
        }

        if (!result.metadata.context) {
          result.metadata.context = {
            area: selectedArea,
            section: finalSection,
            dimensions: '',
            aspect_ratio: ''
          }
        }

        // Add default dimensions for team member images
        if (selectedArea === 'team') {
          result.metadata.context.dimensions = '600x800'
          result.metadata.context.aspect_ratio = '0.75'
          result.metadata.context.area = 'team'
          result.metadata.context.section = 'headshots'
        }

        onUploadComplete(result)
        setProgress(100)
      } catch (error) {
        console.error('Upload error:', error)
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="area">Image Area</Label>
          <Select
            value={selectedArea}
            onValueChange={(value) => setSelectedArea(value as ImageArea)}
            disabled={Boolean(assetId)}
          >
            <SelectTrigger id="area">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero Images</SelectItem>
              <SelectItem value="gallery">Gallery Images</SelectItem>
              <SelectItem value="service">Service Images</SelectItem>
              <SelectItem value="team">Team Member Images</SelectItem>
              <SelectItem value="logo">Logo & Branding</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!assetId && (
          <div>
            <Label htmlFor="assetName">Asset Name</Label>
            <Input
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g., team-member-name"
            />
          </div>
        )}

        {selectedArea !== 'team' && (
          <div>
            <Label htmlFor="section">Section (Optional)</Label>
            <Input
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., medical-spa"
            />
          </div>
        )}
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
          <div className="space-y-2">
            <p>Drag &apos;n&apos; drop an image here, or click to select</p>
            {selectedArea === 'team' && (
              <p className="text-sm text-muted-foreground">
                Team member images will be automatically cropped to 3:4 ratio (600x800px)
              </p>
            )}
          </div>
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