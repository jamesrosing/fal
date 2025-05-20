"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
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
import { Gallery, Album, Case, Image as GalleryImage } from "@/lib/supabase"
import { Share2, Heart } from "lucide-react"
import CldImage from '@/components/media/CldImage'
import CldVideo from '@/components/media/CldVideo'

export default function GalleryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[] || []
  
  // State for data
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [cases, setCases] = useState<(Case & { images: GalleryImage[] })[]>([])
  const [currentCase, setCurrentCase] = useState<Case & { images: GalleryImage[] } | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data based on slug path
  useEffect(() => {
    const fetchGalleryData = async () => {
      setLoading(true)
      try {
        // Always fetch galleries
        const galleriesResponse = await fetch('/api/gallery/collections')
        const galleriesData = await galleriesResponse.json()
        setGalleries(galleriesData.collections || [])
        
        // If no slug, just show galleries
        if (!slug || slug.length === 0) {
          setLoading(false)
          return
        }
        
        // If 1 slug param, fetch albums for that gallery
        if (slug.length === 1) {
          const albumsResponse = await fetch(`/api/gallery/albums?collection=${slug[0]}`)
          const albumsData = await albumsResponse.json()
          setAlbums(albumsData.albums || [])
          setLoading(false)
          return
        }
        
        // If 2 slug params, fetch cases for that album
        if (slug.length === 2) {
          const casesResponse = await fetch(`/api/gallery/cases?collection=${slug[0]}&album=${slug[1]}`)
          const casesData = await casesResponse.json()
          setCases(casesData.cases || [])
          setAlbums([]) // Clear albums
          setLoading(false)
          return
        }
        
        // If 3 slug params, fetch the specific case
        if (slug.length === 3) {
          const caseResponse = await fetch(`/api/gallery/cases/${slug[2]}`)
          const caseData = await caseResponse.json()
          setCurrentCase(caseData.case || null)
          setCases([]) // Clear cases
          setAlbums([]) // Clear albums
          setLoading(false)
          return
        }
        
      } catch (error) {
        console.error('Error fetching gallery data:', error)
        setLoading(false)
      }
    }
    
    fetchGalleryData()
  }, [slug])

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
    // Handle error state when no data is available
    if (!galleries || galleries.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Galleries Available</h3>
          <p className="text-zinc-400">
            No gallery collections are currently available. Please check back later.
          </p>
        </div>
      );
    }

    if (currentCase) {
      // Check if the case has images
      if (!currentCase.images || currentCase.images.length === 0) {
        return (
          <div className="text-center py-12 px-4">
            <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Images Available</h3>
            <p className="text-zinc-400">
              This case currently has no images. Please check back later.
            </p>
          </div>
        );
      }
      
      return (
        <div className="max-w-7xl mx-auto">
          <CaseViewer images={currentCase.images.map(img => ({
            id: img.id,
            url: img.cloudinary_url
          }))} />
        </div>
      )
    }

    if (cases && cases.length > 0) {
      // Sort cases by extracting the number from the title (e.g. "Case 1" -> 1)
      const sortedCases = [...cases].sort((a, b) => {
        const aNum = parseInt(a.title.replace(/[^0-9]/g, '')) || 0
        const bNum = parseInt(b.title.replace(/[^0-9]/g, '')) || 0
        return aNum - bNum
      })

      return (
        <div>
          {cases.length === 0 ? (
            <div className="text-center py-12 px-4">
              <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Cases Yet</h3>
              <p className="text-zinc-400">
                This album is currently empty. Check back soon for new cases.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCases.map((case_) => (
                <Link
                  key={case_.id}
                  href={`/gallery/${slug[0]}/${slug[1]}/${case_.id}`}
                  className="group block"
                >
                  <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors">
                    {case_.images && case_.images[0] ? (
                      <div className="relative w-full h-48">
                        <CldImage
                          src={case_.images[0].cloudinary_url}
                          alt={case_.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 right-2 w-5 h-5 flex items-center justify-center bg-black/40 rounded-full text-xs text-zinc-400 opacity-70">
                          {parseInt(case_.title.replace(/[^0-9]/g, '')) || '?'}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500">No Image</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-cerebri text-sm uppercase tracking-wide font-light">{case_.title}</h3>
                      {case_.description && (
                        <p className="text-zinc-400 text-sm mt-1">{case_.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    // If viewing a gallery collection
    if (albums && albums.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => {
            const albumSlug = album.title.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link 
                href={`/gallery/${slug[0]}/${albumSlug}`} 
                key={`album-${album.id}`} 
                className="block"
              >
                <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="relative w-full h-40">
                    <CldImage
                      src={`placeholders/album-${album.id}`}
                      alt={album.title}
                      fill
                      className="object-cover rounded-md"
                      fallbackSrc={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(album.title)}`}
                    />
                  </div>
                  <h3 className="mt-2 text-lg font-cerebri font-light uppercase tracking-wide">{album.title}</h3>
                  {album.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )
    }

    // If albums array is empty but we're at a collection view
    if (albums && albums.length === 0 && slug.length === 1) {
      return (
        <div className="text-center py-12 px-4">
          <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Albums Yet</h3>
          <p className="text-zinc-400">
            This gallery collection is currently empty. Check back soon for new albums.
          </p>
        </div>
      );
    }

    // Main gallery page (collections)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => {
          const gallerySlug = gallery.title.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link 
              href={`/gallery/${gallerySlug}`} 
              key={`collection-${gallery.id}`} 
              className="block"
            >
              <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="relative w-full h-40">
                  <CldImage
                    src={`placeholders/gallery-${gallery.id}`}
                    alt={gallery.title}
                    fill
                    className="object-cover rounded-md"
                    fallbackSrc={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(gallery.title)}`}
                  />
                </div>
                <h3 className="mt-2 text-lg font-semibold capitalize">{gallery.title.replace(/-/g, " ")}</h3>
                {gallery.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{gallery.description}</p>
                )}
              </div>
            </Link>
          );
        })}
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


