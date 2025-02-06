"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavAdmin } from "@/components/nav-admin"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useDropzone } from 'react-dropzone'
import { uploadToCloudinary } from "@/lib/cloudinary-upload"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import { resizeImage } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FileRejection, DropEvent } from 'react-dropzone'
import { toast } from "@/components/ui/use-toast"
import { deleteFromCloudinary } from "@/lib/cloudinary-upload"
import { Toaster } from "@/components/ui/toaster"

interface CloudinaryImage {
  id: string
  url: string
  public_id: string
  metadata: {
    width: number
    height: number
    format: string
  }
}

interface Case {
  id: string
  title: string
  images: CloudinaryImage[]
}

interface Album {
  title: string
  cases: Case[]
}

interface Collection {
  title: string
  albums: { [key: string]: Album }
}

interface Collections {
  [key: string]: Collection
}

// Helper function to generate placeholder cases
const generatePlaceholderCases = (albumName: string) => {
  return Array.from({ length: 4 }, (_, i) => ({
    id: String(i + 1),
    title: String(i + 1),
    images: Array.from({ length: 5 }, (_, j) => ({
      id: String(j + 1),
      url: "/placeholder.jpg",
      public_id: `placeholder/${albumName}/${i + 1}/${j + 1}`,
      metadata: {
        width: 800,
        height: 600,
        format: "jpg"
      }
    }))
  }))
}

// Define the collections structure with cases
const collections: Collections = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    albums: {
      "face": {
        title: "Face",
        cases: generatePlaceholderCases("Face")
      },
      "eyelids": {
        title: "Eyelids",
        cases: generatePlaceholderCases("Eyelids")
      },
      "ears": {
        title: "Ears",
        cases: generatePlaceholderCases("Ears")
      },
      "nose": {
        title: "Nose",
        cases: generatePlaceholderCases("Nose")
      },
      "neck": {
        title: "Neck",
        cases: generatePlaceholderCases("Neck")
      },
      "breast-augmentation": {
        title: "Breast Augmentation",
        cases: generatePlaceholderCases("Breast Augmentation")
      },
      "breast-lift": {
        title: "Breast Lift",
        cases: generatePlaceholderCases("Breast Lift")
      },
      "breast-reduction": {
        title: "Breast Reduction",
        cases: generatePlaceholderCases("Breast Reduction")
      },
      "breast-revision": {
        title: "Breast Revision",
        cases: generatePlaceholderCases("Breast Revision")
      },
      "breast-nipple-areolar-complex": {
        title: "Breast Nipple Areolar Complex",
        cases: generatePlaceholderCases("Breast Nipple Areolar Complex")
      },
      "abdominoplasty": {
        title: "Abdominoplasty",
        cases: generatePlaceholderCases("Abdominoplasty")
      },
      "mini-abdominoplasty": {
        title: "Mini Abdominoplasty",
        cases: generatePlaceholderCases("Mini Abdominoplasty")
      },
      "liposuction": {
        title: "Liposuction",
        cases: generatePlaceholderCases("Liposuction")
      },
      "arm-lift": {
        title: "Arm Lift",
        cases: generatePlaceholderCases("Arm Lift")
      },
      "thigh-lift": {
        title: "Thigh Lift",
        cases: generatePlaceholderCases("Thigh Lift")
      }
    }
  },
  "emsculpt": {
    title: "Emsculpt",
    albums: {
      "abdomen": {
        title: "Abdomen",
        cases: generatePlaceholderCases("Abdomen")
      },
      "buttocks": {
        title: "Buttocks",
        cases: generatePlaceholderCases("Buttocks")
      },
      "arms": {
        title: "Arms",
        cases: generatePlaceholderCases("Arms")
      },
      "calves": {
        title: "Calves",
        cases: generatePlaceholderCases("Calves")
      }
    }
  },
  "sylfirmx": {
    title: "Sylfirm X",
    albums: {
      "face": {
        title: "Face",
        cases: generatePlaceholderCases("Sylfirm X Face")
      }
    }
  },
  "facials": {
    title: "Facials",
    albums: {
      "hydrafacial": {
        title: "HydraFacial",
        cases: generatePlaceholderCases("HydraFacial")
      }
    }
  }
}

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [currentCollection, setCurrentCollection] = useState<string | undefined>()
  const [currentAlbum, setCurrentAlbum] = useState<string | undefined>()
  const [currentCase, setCurrentCase] = useState<string | undefined>()
  const [selectedImage, setSelectedImage] = useState<{ id: string; url: string } | null>(null)
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false)
  const [newCaseTitle, setNewCaseTitle] = useState("")
  const [newCaseImages, setNewCaseImages] = useState<File[]>([])

  const handleNavigate = (section: string, collection?: string) => {
    setCurrentSection(section)
    setCurrentCollection(collection)
    setCurrentAlbum(undefined)
    setCurrentCase(undefined)
    setSelectedImage(null)
  }

  const handleAlbumClick = (albumId: string) => {
    setCurrentAlbum(albumId)
    setCurrentCase(undefined)
    setSelectedImage(null)
  }

  const handleCaseClick = (caseId: string) => {
    setCurrentCase(caseId)
    if (currentCollection && currentAlbum) {
      const caseItem = collections[currentCollection]?.albums[currentAlbum]?.cases.find(c => c.id === caseId)
      if (caseItem && caseItem.images && caseItem.images.length > 0) {
        setSelectedImage(caseItem.images[0])
      }
    }
  }

  const handleBack = () => {
    if (currentCase) {
      setCurrentCase(undefined)
      setSelectedImage(null)
    } else if (currentAlbum) {
      setCurrentAlbum(undefined)
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (currentCollection && currentAlbum && currentCase) {
      try {
        const updatedCollections = { ...collections }
        const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
          .find(c => c.id === currentCase)
        
        if (caseItem) {
          const imageToDelete = caseItem.images.find(img => img.id === imageId)
          if (imageToDelete?.public_id) {
            await deleteFromCloudinary(imageToDelete.public_id)
          }
          caseItem.images = caseItem.images.filter(img => img.id !== imageId)
          // Update collections state here when we add proper state management
          toast({
            title: "Image deleted",
            description: "The image has been successfully deleted.",
          })
        }
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast({
          title: "Error",
          description: "Failed to delete the image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Handle image upload to Cloudinary
  const uploadImageToCloudinary = async (file: File, customFilename?: string) => {
    try {
      // Resize image before upload if needed
      const resizedImage = await resizeImage(file, 2048)
      
      // Upload to Cloudinary with proper path structure
      const section = `${currentCollection}/${currentAlbum}/${currentCase}`
      const result = await uploadToCloudinary(
        new File([resizedImage], file.name, { type: file.type }),
        "gallery",
        section,
        customFilename
      )

      toast({
        title: "Image uploaded",
        description: "The image has been successfully uploaded.",
      })

      return {
        id: result.public_id.split('/').pop() || Math.random().toString(36).substr(2, 9),
        url: result.url,
        public_id: result.public_id,
        metadata: result.metadata
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast({
        title: "Error",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle image replacement via drag and drop
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    if (currentCollection && currentAlbum && currentCase) {
      try {
        const uploadPromises = acceptedFiles.map(file => uploadImageToCloudinary(file))
        const uploadedImages = await Promise.all(uploadPromises)
        
        const updatedCollections = { ...collections }
        const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
          .find(c => c.id === currentCase)
        
        if (caseItem) {
          // Update the images array with the new uploads
          caseItem.images = [...caseItem.images, ...uploadedImages]
          
          // If this is the first image being added, set it as selected
          if (caseItem.images.length === uploadedImages.length) {
            setSelectedImage(uploadedImages[0])
          }
          
          // Update collections state here when we add proper state management
          toast({
            title: "Images added",
            description: `Successfully added ${uploadedImages.length} images.`,
          })
        }
      } catch (error) {
        console.error('Failed to process images:', error)
        toast({
          title: "Error",
          description: "Failed to process some images. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [currentCollection, currentAlbum, currentCase])

  // Handle image replacement for a specific image
  const handleImageReplace = useCallback((imageId: string) => {
    return async (file: File) => {
      try {
        if (currentCollection && currentAlbum && currentCase) {
          const uploadedImage = await uploadImageToCloudinary(file, imageId)
          
          const updatedCollections = { ...collections }
          const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
            .find(c => c.id === currentCase)
          
          if (caseItem) {
            const index = caseItem.images.findIndex(img => img.id === imageId)
            if (index !== -1) {
              caseItem.images[index] = uploadedImage
            }
            // Update collections state here when we add proper state management
          }
        }
      } catch (error) {
        console.error('Failed to replace image:', error)
        // TODO: Add error handling UI feedback
      }
    }
  }, [currentCollection, currentAlbum, currentCase])

  const { getRootProps: getAddImageRootProps, getInputProps: getAddImageInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    noClick: false,
    noDrag: false
  })

  const { getRootProps: getReplaceImageRootProps, getInputProps: getReplaceImageInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    noClick: false,
    noDrag: false
  })

  // Handle new case creation
  const handleAddCase = () => {
    if (currentCollection && currentAlbum && newCaseTitle.trim()) {
      const newCase: Case = {
        id: Math.random().toString(36).substr(2, 9),
        title: newCaseTitle,
        images: []
      }
      
      const updatedCollections = { ...collections }
      updatedCollections[currentCollection].albums[currentAlbum].cases.push(newCase)
      // Update collections state here when we add proper state management
      
      setNewCaseTitle("")
      setNewCaseImages([])
      setIsAddCaseDialogOpen(false)
      handleCaseClick(newCase.id)
    }
  }

  const renderBreadcrumbs = () => {
    const items = [
      { label: "Admin Dashboard", href: "#", onClick: () => handleNavigate("dashboard") }
    ]

    if (currentSection === "collections" && currentCollection) {
      items.push(
        { label: "Collections", href: "#", onClick: () => handleNavigate("collections") },
        { label: collections[currentCollection]?.title || currentCollection, href: "#", onClick: () => {} }
      )

      if (currentAlbum) {
        const album = collections[currentCollection]?.albums[currentAlbum]
        items.push({ 
          label: album?.title || currentAlbum, 
          href: "#", 
          onClick: () => setCurrentAlbum(currentAlbum) 
        })

        if (currentCase) {
          const caseItem = album?.cases.find(c => c.id === currentCase)
          items.push({ 
            label: caseItem?.title || `Case ${currentCase}`, 
            href: "#", 
            onClick: () => {} 
          })
        }
      }
    } else if (currentSection !== "dashboard") {
      items.push({ 
        label: currentSection.charAt(0).toUpperCase() + currentSection.slice(1), 
        href: "#", 
        onClick: () => {} 
      })
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {index === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href} onClick={item.onClick}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const renderContent = () => {
    if (currentSection === "collections" && currentCollection) {
      const collection = collections[currentCollection]
      if (!collection) return null

      // Show case details
      if (currentAlbum && currentCase) {
        const album = collection.albums[currentAlbum]
        const caseItem = album?.cases.find(c => c.id === currentCase)
        if (!caseItem || !selectedImage) return null

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Button>
              <h1 className="text-2xl font-semibold">{caseItem.title}</h1>
            </div>

            {/* Main selected image with drag-drop replacement */}
            <Card className="overflow-hidden bg-transparent border-0 w-full max-w-[1800px] mx-auto">
              <div className="relative aspect-[16/9] w-full">
                {selectedImage && (
                  <>
                    <div {...getReplaceImageRootProps({
                      onDrop: () => {},
                      onClick: (e) => e.stopPropagation()
                    })}>
                      <input {...getReplaceImageInputProps()} />
                      <Image
                        src={selectedImage.url}
                        alt={`Case image ${selectedImage.id}`}
                        fill
                        className="object-contain"
                        sizes="(min-width: 1800px) 1800px, (min-width: 1200px) 1200px, 100vw"
                        quality={90}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Image carousel with management options */}
            <div className="grid grid-cols-5 gap-4 max-w-[1800px] mx-auto">
              {caseItem.images.map((image) => (
                <Card 
                  key={image.id} 
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all group w-full",
                    selectedImage?.id === image.id 
                      ? "ring-1 ring-primary" 
                      : "hover:ring-1 hover:ring-primary/50"
                  )}
                >
                  <div 
                    className="relative aspect-[16/9]"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div {...getReplaceImageRootProps({
                      onDrop: () => {},
                      onClick: (e) => e.stopPropagation()
                    })}>
                      <input {...getReplaceImageInputProps()} />
                      <Image
                        src={image.url}
                        alt={`Case image ${image.id}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1800px) 360px, (min-width: 1200px) 300px, (min-width: 768px) 240px, 100vw"
                        quality={90}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(image.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              {/* Add new image card */}
              <Card 
                className="overflow-hidden cursor-pointer hover:border-primary w-full"
              >
                <div {...getAddImageRootProps()}>
                  <input {...getAddImageInputProps()} />
                  <div className="relative aspect-[16/9] flex items-center justify-center border-2 border-dashed">
                    <Plus className="h-8 w-8" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )
      }

      // Show album cases
      if (currentAlbum) {
        const album = collection.albums[currentAlbum]
        if (!album) return null

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Albums
              </Button>
              <div className="flex items-center justify-between flex-1">
                <h1 className="text-2xl font-semibold">{album.title} Cases</h1>
                <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Case</DialogTitle>
                      <DialogDescription>
                        Create a new case and add images to it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Case Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter case title"
                          value={newCaseTitle}
                          onChange={(e) => setNewCaseTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCaseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCase} disabled={!newCaseTitle.trim()}>
                        Create Case
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {album.cases.map((case_) => (
                <Card key={case_.id} className="overflow-hidden cursor-pointer hover:border-primary w-full" 
                      onClick={() => handleCaseClick(case_.id)}>
                  {case_.images[0] && (
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={case_.images[0].url}
                        alt={case_.title}
                        fill
                        className="object-contain"
                        sizes="(min-width: 1800px) 800px, (min-width: 1200px) 600px, 100vw"
                        quality={90}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-cerebri font-light uppercase">{case_.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-muted-foreground">
                      {case_.images.length} images
                    </span>
                  </CardContent>
                </Card>
              ))}
              {album.cases.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No cases found in this album.</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Case
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      }

      // Show collection albums
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{collection.title} Albums</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Album
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(collection.albums).map(([id, album]) => (
              <Card key={id} className="cursor-pointer hover:border-primary" 
                    onClick={() => handleAlbumClick(id)}>
                <CardHeader>
                  <CardTitle className="text-lg font-cerebri font-light uppercase">{album.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {album.cases.length} {album.cases.length === 1 ? 'case' : 'cases'}
                    </span>
                    <Button variant="ghost" size="sm">View Album</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {Object.keys(collection.albums).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No albums found in this collection.</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Album
                </Button>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Default dashboard view
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard.</p>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <NavAdmin 
          onNavigate={handleNavigate}
          currentSection={currentSection}
          currentCollection={currentCollection}
        />
        <SidebarInset className="flex-grow">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center">
              {renderBreadcrumbs()}
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="container max-w-[1800px] mx-auto px-8 py-6">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}