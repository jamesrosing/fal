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
import { Gallery, Album, Case, Image as GalleryImage } from "@/lib/supabase"
import { Share2, Heart } from "lucide-react"

interface PageProps {
  galleries: Gallery[];
  albums?: Album[];
  cases?: (Case & { images: GalleryImage[] })[];
  currentCase?: Case & { images: GalleryImage[] };
  currentAlbum?: Album;
}

export default function GalleryPage({ galleries, albums, cases, currentCase, currentAlbum }: PageProps) {
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
    if (currentCase) {
      return (
        <div className="max-w-7xl mx-auto">
          <CaseViewer images={currentCase.images.map(img => ({
            id: img.id,
            url: img.cloudinary_url
          }))} />
        </div>
      )
    }

    if (cases) {
      // Sort cases by extracting the number from the title (e.g. "Case 1" -> 1)
      const sortedCases = [...cases].sort((a, b) => {
        const aNum = parseInt(a.title.replace(/[^0-9]/g, ''))
        const bNum = parseInt(b.title.replace(/[^0-9]/g, ''))
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
                  href={`/gallery/${slug[0]}/${case_.id}`}
                  className="group block"
                >
                  <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors">
                    {case_.images[0] && (
                      <div className="relative w-full h-48">
                        <Image
                          src={case_.images[0].cloudinary_url}
                          alt={case_.title}
                          fill
                          className="object-cover"
                        />
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
    if (albums) {
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
                    <Image
                      src={`/placeholder.svg?height=200&width=300&text=${album.title}`}
                      alt={album.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <h3 className="mt-2 text-lg font-cerebri font-light uppercase tracking-wide">{album.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      )
    }

    // Main gallery page (collections)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <Link 
            href={`/gallery/${gallery.id}`} 
            key={`collection-${gallery.id}`} 
            className="block"
          >
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="relative w-full h-40">
                <Image
                  src={`/placeholder.svg?height=200&width=300&text=${gallery.title}`}
                  alt={gallery.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <h3 className="mt-2 text-lg font-semibold capitalize">{gallery.title.replace(/-/g, " ")}</h3>
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


