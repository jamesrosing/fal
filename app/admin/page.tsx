"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import BackgroundRemover from "@/components/background-remover"
import VBlobImageUploader from "@/components/vblob-image-uploader"

export default function AdminPage() {
  const [showBackgroundTool, setShowBackgroundTool] = useState(false)

  const handleBlobImageUploaded = (url: string) => {
    console.log("Image uploaded to Vercel Blob:", url)
    // Do something with the URL if needed
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {showBackgroundTool ? (
            <BackgroundRemover />
          ) : (
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center gap-2"
                  onClick={() => setShowBackgroundTool(true)}
                >
                  <span className="text-lg font-semibold">Background Removal Tool</span>
                  <span className="text-sm text-muted-foreground">Remove backgrounds from images</span>
                </Button>
                {/* Add more admin tools here */}
              </div>

              {/* Blob Upload Section */}
              <section>
                <h2 className="text-xl mb-4">Vercel Blob Upload</h2>
                <VBlobImageUploader onImageUploaded={handleBlobImageUploaded} />
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}