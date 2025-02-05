"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CaseViewer } from "@/components/case-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

interface GalleryCase {
  id: string
  coverImage: string
  images: Array<{
    id: string
    url: string
  }>
}

interface GalleryAlbum {
  id: string
  title: string
  imageUrl: string
}

interface GalleryData {
  [key: string]: GalleryAlbum[]
}

interface CaseData {
  [key: string]: GalleryCase[]
}

const mockData: GalleryData = {
  "plastic-surgery": [
    { id: "face", title: "Face", imageUrl: "/placeholder.svg?height=200&width=300&text=Face" },
    { id: "eyelids", title: "Eyelids", imageUrl: "/placeholder.svg?height=200&width=300&text=Eyelids" },
    { id: "ears", title: "Ears", imageUrl: "/placeholder.svg?height=200&width=300&text=Ears" },
    { id: "nose", title: "Nose", imageUrl: "/placeholder.svg?height=200&width=300&text=Nose" },
    { id: "neck", title: "Neck", imageUrl: "/placeholder.svg?height=200&width=300&text=Neck" },
    {
      id: "breast-augmentation",
      title: "Breast Augmentation",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Breast+Augmentation",
    },
    { id: "breast-lift", title: "Breast Lift", imageUrl: "/placeholder.svg?height=200&width=300&text=Breast+Lift" },
    {
      id: "breast-reduction",
      title: "Breast Reduction",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Breast+Reduction",
    },
    {
      id: "breast-revision",
      title: "Breast Revision",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Breast+Revision",
    },
    {
      id: "breast-nipple-areolar-complex",
      title: "Breast Nipple Areolar Complex",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Breast+Nipple+Areolar+Complex",
    },
    {
      id: "abdominoplasty",
      title: "Abdominoplasty",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Abdominoplasty",
    },
    {
      id: "mini-abdominoplasty",
      title: "Mini Abdominoplasty",
      imageUrl: "/placeholder.svg?height=200&width=300&text=Mini+Abdominoplasty",
    },
    { id: "liposuction", title: "Liposuction", imageUrl: "/placeholder.svg?height=200&width=300&text=Liposuction" },
    { id: "arm-lift", title: "Arm Lift", imageUrl: "/placeholder.svg?height=200&width=300&text=Arm+Lift" },
    { id: "thigh-lift", title: "Thigh Lift", imageUrl: "/placeholder.svg?height=200&width=300&text=Thigh+Lift" },
  ],
  emsculpt: [
    { id: "abdomen", title: "Abdomen", imageUrl: "/placeholder.svg?height=200&width=300&text=Abdomen" },
    { id: "buttocks", title: "Buttocks", imageUrl: "/placeholder.svg?height=200&width=300&text=Buttocks" },
    { id: "arms", title: "Arms", imageUrl: "/placeholder.svg?height=200&width=300&text=Arms" },
    { id: "calves", title: "Calves", imageUrl: "/placeholder.svg?height=200&width=300&text=Calves" },
  ],
  sylfirmx: [
    {
      id: "placeholder",
      title: "SylfirmX Placeholder",
      imageUrl: "/placeholder.svg?height=200&width=300&text=SylfirmX",
    },
  ],
  facials: [
    { id: "placeholder", title: "Facials Placeholder", imageUrl: "/placeholder.svg?height=200&width=300&text=Facials" },
  ],
}

// Function to generate case data
const generateCaseData = (albumId: string, caseCount = 4): GalleryCase[] =>
  Array.from({ length: caseCount }, (_, i) => ({
    id: String(i + 1),
    coverImage: `/placeholder.svg?height=200&width=300&text=${albumId}-Case${i + 1}`,
    images: Array.from({ length: 5 }, (_, j) => ({
      id: `result-${j + 1}`,
      url: `/placeholder.svg?height=600&width=800&text=${albumId}-Case${i + 1}-Image${j + 1}`,
    })),
  }))

// Generate case data for all albums
const caseData: CaseData = Object.keys(mockData).reduce((acc, gallery) => {
  mockData[gallery].forEach((album) => {
    acc[`${gallery}/${album.id}`] = generateCaseData(album.id)
  })
  return acc
}, {} as CaseData)

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[]

  const renderBreadcrumbs = () => {
    // For case view, only show the case number and a back button
    if (slug.length > 2 && !isNaN(Number(slug[slug.length - 1]))) {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href={`/gallery/${slug.slice(0, -1).join("/")}`} passHref legacyBehavior>
                <BreadcrumbLink>
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Back to Album
                </BreadcrumbLink>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{slug[slug.length - 1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }

    // For album or collection view, show the full path
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/gallery" className="hover:text-white">
              Gallery
            </Link>
          </BreadcrumbItem>
          {slug.map((segment, i) => (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === slug.length - 1 ? (
                  <BreadcrumbPage>{segment.replace(/-/g, ' ')}</BreadcrumbPage>
                ) : (
                  <Link 
                    href={`/gallery/${slug.slice(0, i + 1).join('/')}`}
                    className="hover:text-white capitalize"
                  >
                    {segment.replace(/-/g, ' ')}
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const renderContent = () => {
    // If viewing a case (number)
    if (slug.length > 2 && !isNaN(Number(slug[slug.length - 1]))) {
      const caseNumber = Number(slug[slug.length - 1])
      const albumPath = slug.slice(0, -1).join("/")
      const currentCase = caseData[albumPath]?.[caseNumber - 1]

      if (!currentCase) return <div>Case not found</div>

      return (
        <div className="space-y-4">
          <Button variant="ghost" className="items-center gap-2 md:hidden" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back to Album
          </Button>
          <CaseViewer images={currentCase.images} />
        </div>
      )
    }

    // If viewing an album
    if (slug.length > 1) {
      const albumPath = slug.join("/")
      const albumCases = caseData[albumPath]
      if (!albumCases) return <div>Album not found</div>

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albumCases.map((caseItem) => (
            <Link href={`/gallery/${albumPath}/${caseItem.id}`} key={`case-${caseItem.id}`} className="block">
              <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="relative w-full h-40">
                  <Image
                    src={caseItem.coverImage}
                    alt={`Case ${caseItem.id}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="mt-2 text-lg font-semibold">Case {caseItem.id}</h3>
              </div>
            </Link>
          ))}
        </div>
      )
    }

    // If viewing a gallery collection
    if (slug.length === 1) {
      const galleryData = mockData[slug[0]]
      if (!galleryData) return <div>Gallery not found</div>

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryData.map((album) => (
            <Link href={`/gallery/${slug[0]}/${album.id}`} key={`album-${album.id}`} className="block">
              <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="relative w-full h-40">
                  <Image
                    src={album.imageUrl}
                    alt={album.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="mt-2 text-lg font-semibold">{album.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )
    }

    // Main gallery page (collections)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(mockData).map(([collectionId]) => (
          <Link href={`/gallery/${collectionId}`} key={`collection-${collectionId}`} className="block">
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="relative w-full h-40">
                <Image
                  src={`/placeholder.svg?height=200&width=300&text=${collectionId}`}
                  alt={collectionId}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="mt-2 text-lg font-semibold capitalize">{collectionId.replace("-", " ")}</h3>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <AppSidebar isAdminPage={false} />
        <SidebarInset className="flex-1 overflow-auto w-full">
          <div className="p-6 max-w-full">
            {renderBreadcrumbs()}
            <div className="mt-6">{renderContent()}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}


