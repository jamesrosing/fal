"use client"

import * as React from "react"
import { useState } from "react"
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
import { Plus, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

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

            {/* Main selected image */}
            <Card className="overflow-hidden bg-transparent border-0">
              <div className="relative aspect-video">
                <Image
                  src={selectedImage.url}
                  alt={`Case image ${selectedImage.id}`}
                  fill
                  className="object-contain"
                />
              </div>
            </Card>

            {/* Image carousel */}
            <div className="grid grid-cols-5 gap-4">
              {caseItem.images.map((image) => (
                <Card 
                  key={image.id} 
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all",
                    selectedImage.id === image.id 
                      ? "ring-2 ring-primary" 
                      : "hover:ring-2 hover:ring-primary/50"
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={`Case image ${image.id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
              ))}
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Case
                </Button>
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
                  <CardTitle className="text-lg">{album.title}</CardTitle>
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