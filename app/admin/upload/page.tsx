"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
  })

  const uploadFiles = async () => {
    setUploading(true)
    setProgress(0)

    // Simulating file upload
    for (let i = 0; i < files.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProgress((prev) => prev + 100 / files.length)
    }

    setUploading(false)
    setFiles([])
    setProgress(0)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Upload Files</h1>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
              )}
            </div>
            {files.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Selected Files:</h2>
                <ul className="list-disc pl-5">
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {files.length > 0 && !uploading && (
              <Button onClick={uploadFiles} className="mt-4">
                Upload Files
              </Button>
            )}
            {uploading && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-center mt-2">{Math.round(progress)}% Uploaded</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Here&apos;s what you&apos;ll need:
            </p>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

