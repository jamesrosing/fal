"use client"

import { useState } from "react"
import { ImageAssetUpload } from "@/components/image-asset-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import Image from "next/image"
import { getImageUrl } from "@/lib/image-config"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


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
                  <ImageAssetUpload
                    onUploadComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>

              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recently Uploaded</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.public_id} className="relative aspect-[4/3]">
                          <Image
                            src={image.url}
                            alt={`Uploaded ${image.public_id}`}
                            fill
                            className="object-cover rounded-lg"
                          />
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

