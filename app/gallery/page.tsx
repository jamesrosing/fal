"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Share2, Heart } from "lucide-react"
import { NavBar } from "@/components/nav-bar"

interface GalleryCollection {
  id: string
  title: string
  subtitle: string
  institution: string
  imageUrl: string
  itemCount: number
}

// This would eventually come from your database
const collections: GalleryCollection[] = [
  {
    id: "plastic-surgery",
    title: "Plastic Surgery",
    subtitle: "Surgical Transformations",
    institution: "Allure MD",
    imageUrl: "/images/gallery/plastic-surgery.jpg",
    itemCount: 15
  },
  {
    id: "emsculpt",
    title: "Emsculpt",
    subtitle: "Body Sculpting",
    institution: "Allure MD",
    imageUrl: "/images/gallery/emsculpt.jpg",
    itemCount: 4
  },
  {
    id: "sylfirmx",
    title: "SylfirmX",
    subtitle: "Skin Rejuvenation",
    institution: "Allure MD",
    imageUrl: "/images/gallery/sylfirmx.jpg",
    itemCount: 8
  },
  {
    id: "facials",
    title: "Facials",
    subtitle: "Skin Care Treatments",
    institution: "Allure MD",
    imageUrl: "/images/gallery/facials.jpg",
    itemCount: 6
  }
]

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full">
        <Image
          src="/images/gallery/hero.jpg"
          alt="Gallery Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-6xl">
            <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">Gallery</h1>
            <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif text-white">Before & After Transformations</h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p className="text-white/90 max-w-3xl">
                Explore our gallery to see the stunning transformations achieved by our expert team at Allure MD.
              </p>
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-white/10">
                  <Heart className="w-6 h-6 text-white" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10">
                  <Share2 className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={collection.imageUrl}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white group-hover:text-white/80">
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