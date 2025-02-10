"use client"

import { useState } from "react"
import { StructuredImageUpload } from "@/components/structured-image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

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

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const handleUploadComplete = (result: UploadedImage) => {
    setUploadedImages((prev) => [result, ...prev])
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow overflow-auto">
          <div className="p-6">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <StructuredImageUpload
                    onUploadComplete={handleUploadComplete}
                  />
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

