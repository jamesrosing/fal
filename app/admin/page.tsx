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

interface Case {
  id: string
  title: string
  images: Array<{
    id: string
    url: string
  }>
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
      url: "/placeholder.jpg"
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
    // Set the first image as selected when opening a case
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
  const handleDeleteImage = (imageId: string) => {
    if (currentCollection && currentAlbum && currentCase) {
      const updatedCollections = { ...collections }
      const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
        .find(c => c.id === currentCase)
      
      if (caseItem) {
        caseItem.images = caseItem.images.filter(img => img.id !== imageId)
        // Update collections state here when we add proper state management
      }
    }
  }

  // Handle image replacement via drag and drop
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const newImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string
        }
        
        if (currentCollection && currentAlbum && currentCase) {
          const updatedCollections = { ...collections }
          const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
            .find(c => c.id === currentCase)
          
          if (caseItem) {
            caseItem.images.push(newImage)
            // Update collections state here when we add proper state management
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }, [currentCollection, currentAlbum, currentCase])

  // Handle image replacement for a specific image
  const handleImageReplace = useCallback((imageId: string) => {
    return (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newImage = {
          id: imageId,
          url: reader.result as string
        }
        
        if (currentCollection && currentAlbum && currentCase) {
          const updatedCollections = { ...collections }
          const caseItem = updatedCollections[currentCollection].albums[currentAlbum].cases
            .find(c => c.id === currentCase)
          
          if (caseItem) {
            const index = caseItem.images.findIndex(img => img.id === imageId)
            if (index !== -1) {
              caseItem.images[index] = newImage
            }
            // Update collections state here when we add proper state management
          }
        }
      }
      reader.readAsDataURL(file)
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
            <Card className="overflow-hidden bg-transparent border-0">
              <div className="relative aspect-video">
                {selectedImage && (
                  <>
                    <div {...getReplaceImageRootProps({
                      onDrop: () => {},
                      onClick: (e) => e.stopPropagation()
                    })}>
                      <input {...getReplaceImageInputProps({
                        onChange: (e) => {
                          const files = e.target.files
                          if (files?.length) {
                            handleImageReplace(selectedImage.id)(files[0])
                          }
                        }
                      })} />
                      <Image
                        src={selectedImage.url}
                        alt={`Case image ${selectedImage.id}`}
                        fill
                        className="object-contain"
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
            <div className="grid grid-cols-5 gap-4">
              {caseItem.images.map((image) => (
                <Card 
                  key={image.id} 
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all group",
                    selectedImage?.id === image.id 
                      ? "ring-2 ring-primary" 
                      : "hover:ring-2 hover:ring-primary/50"
                  )}
                >
                  <div 
                    className="relative aspect-square"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div {...getReplaceImageRootProps({
                      onDrop: () => {},
                      onClick: (e) => e.stopPropagation()
                    })}>
                      <input {...getReplaceImageInputProps({
                        onChange: (e) => {
                          const files = e.target.files
                          if (files?.length) {
                            handleImageReplace(image.id)(files[0])
                          }
                        }
                      })} />
                      <Image
                        src={image.url}
                        alt={`Case image ${image.id}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="overflow-hidden cursor-pointer hover:border-primary"
              >
                <div {...getAddImageRootProps()}>
                  <input {...getAddImageInputProps()} />
                  <div className="relative aspect-square flex items-center justify-center border-2 border-dashed">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {album.cases.map((case_) => (
                <Card key={case_.id} className="overflow-hidden cursor-pointer hover:border-primary" 
                      onClick={() => handleCaseClick(case_.id)}>
                  {case_.images[0] && (
                    <div className="relative aspect-video">
                      <Image
                        src={case_.images[0].url}
                        alt={case_.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{case_.title}</CardTitle>
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
            <div className="container mx-auto p-6">
              {renderContent()}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}