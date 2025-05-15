"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


interface GalleryCollection {
  id: string
  title: string
  subtitle: string
  institution: string
  cloudinaryId?: string
  itemCount: number
}

// This would eventually come from your database
const collections: GalleryCollection[] = [
  {
    id: "plastic-surgery",
    title: "Plastic Surgery",
    subtitle: "Surgical Transformations",
    institution: "Allure MD",
    cloudinaryId: "gallery/plastic-surgery",
    itemCount: 15
  },
  {
    id: "emsculpt",
    title: "Emsculpt",
    subtitle: "Body Sculpting",
    institution: "Allure MD",
    cloudinaryId: "gallery/emsculpt",
    itemCount: 4
  },
  {
    id: "sylfirmx",
    title: "SylfirmX",
    subtitle: "Skin Rejuvenation",
    institution: "Allure MD",
    cloudinaryId: "gallery/sylfirmx",
    itemCount: 8
  },
  {
    id: "facials",
    title: "Facials",
    subtitle: "Skin Care Treatments",
    institution: "Allure MD",
    cloudinaryId: "gallery/facials",
    itemCount: 6
  }
]

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col pt-16">
      {/* NavBar is now fixed in its component, so we don't need a container for it */}
      <NavBar />
      
      {/* Mobile-first Hero Section with 16:9 aspect ratio - properly positioned below navbar */}
      <div className="w-full">
        {/* Image container with fixed aspect ratio on mobile, height-based on larger screens */}
        <div className="relative w-full aspect-video md:aspect-auto md:h-[70vh]">
          <Image 
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1747167421/gallery/hero.jpg" 
            alt="Gallery Hero" 
            priority 
            fill
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 90%' }}
          />
          {/* Gradient overlay (only visible on larger screens) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent hidden md:block" />
          
          {/* Text overlay for desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-8 hidden md:block">
            <div className="container mx-auto max-w-6xl">
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">Gallery</h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif text-white">Before & After Transformations</h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p className="text-white/90 max-w-3xl">
                  Explore our gallery to see the stunning transformations achieved by our expert team at Allure MD.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text content below image for mobile */}
        <div className="p-6 bg-black md:hidden">
          <div className="container mx-auto">
            <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">Gallery</h1>
            <h2 className="mb-4 text-4xl leading-none tracking-tight font-serif text-white">Before & After Transformations</h2>
            <div className="space-y-4 text-base font-cerebri font-light">
              <p className="text-white/90">
                Explore our gallery to see the stunning transformations achieved by our expert team at Allure MD.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid - Using same styling approach as hero section */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-serif text-white">
            {collections.length} Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link 
              key={collection.id}
              href={`/gallery/${collection.id}`}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-900">
                  {collection.cloudinaryId ? (
                    <Image
                      src={`https://res.cloudinary.com/dyrzyfg3w/image/upload/${collection.cloudinaryId}.jpg`}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-500">{collection.title}</span>
                    </div>
                  )}
                  {/* Add overlay gradient for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white group-hover:text-white/80 transition-colors duration-300">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {collection.subtitle}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {collection.institution} · {collection.itemCount} items
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
} 