"use client"

import { useState } from "react"
import { StructuredImageUpload } from "@/components/structured-image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageArea } from "@/lib/cloudinary"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import Link from "next/link"

interface UploadedImage {
  url: string
  public_id: string
  metadata: {
    width: number
    height: number
    format: string
    resource_type: string
  }
}

interface GalleryAlbum {
  id: string
  title: string
}

interface GalleryCollection {
  title: string
  albums: GalleryAlbum[]
}

interface GalleryStructure {
  [key: string]: GalleryCollection
}

const galleryStructure: GalleryStructure = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    albums: [
      { id: "face", title: "Face Procedures" },
      { id: "body", title: "Body Procedures" }
    ]
  },
  "dermatology": {
    title: "Dermatology",
    albums: [
      { id: "acne", title: "Acne Treatment" },
      { id: "anti-aging", title: "Anti-Aging" }
    ]
  }
}

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedArea, setSelectedArea] = useState<ImageArea>("hero")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)

  const handleUploadComplete = (result: UploadedImage) => {
    setUploadedImages((prev) => [result, ...prev])
  }

  const renderContent = () => {
    if (!selectedCollection) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Select a collection from the sidebar to manage images</p>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedCollection && galleryStructure[selectedCollection]?.title}
              {selectedAlbum && ` / ${selectedAlbum}`}
            </CardTitle>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Images
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="structured" className="space-y-6">
              <TabsList>
                <TabsTrigger value="structured">Structured Upload</TabsTrigger>
                <TabsTrigger value="gallery">Gallery Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="structured">
                <StructuredImageUpload
                  defaultArea={selectedArea}
                  defaultSection={selectedCollection}
                  onUploadComplete={handleUploadComplete}
                />
              </TabsContent>
              <TabsContent value="gallery">
                <StructuredImageUpload
                  defaultArea="gallery"
                  defaultSection={`${selectedCollection}/${selectedAlbum || ''}`}
                  onUploadComplete={handleUploadComplete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recently Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedImages.map((image, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <p className="text-xs text-white">
                        {image.metadata.width}x{image.metadata.height}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

