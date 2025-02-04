"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StructuredImageUpload } from "@/components/structured-image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UploadedImage {
  url: string;
  public_id: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    resource_type: string;
  };
}

export default function UploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const handleUploadComplete = (result: UploadedImage) => {
    setUploadedImages(prev => [result, ...prev])
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow overflow-y-auto">
          <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Upload Media</h1>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="structured">
                    <TabsList className="mb-4">
                      <TabsTrigger value="structured">Structured Upload</TabsTrigger>
                      <TabsTrigger value="gallery">Gallery Upload</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="structured">
                      <StructuredImageUpload onUploadComplete={handleUploadComplete} />
                    </TabsContent>
                    
                    <TabsContent value="gallery">
                      <StructuredImageUpload 
                        defaultArea="gallery"
                        defaultSection="plastic-surgery"
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <div className="relative aspect-video overflow-hidden rounded-lg border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={`Uploaded image ${index + 1}`}
                              className="object-cover"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            <p>Public ID: {image.public_id}</p>
                            <p>
                              Size: {image.metadata.width}x{image.metadata.height}
                            </p>
                            <p>Format: {image.metadata.format}</p>
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

