"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Share2, Heart } from "lucide-react"

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
    id: "before-after-face",
    title: "Facial Transformations",
    subtitle: "Before & After Gallery",
    institution: "Allure MD",
    imageUrl: "/images/gallery/facial-treatments.jpg",
    itemCount: 24
  },
  {
    id: "body-contouring",
    title: "Body Contouring",
    subtitle: "Sculpting Excellence",
    institution: "Allure MD",
    imageUrl: "/images/gallery/body-contouring.jpg",
    itemCount: 18
  },
  // Add more collections as needed
]

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black">
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
            <h1 className="text-5xl font-serif mb-4 text-white">Gallery</h1>
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

      {/* Collections Grid */}
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-serif text-white">
            {collections.length} Collections
          </h2>
          <Link 
            href="/gallery/all"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </Link>
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
                  <h3 className="text-lg font-medium text-white group-hover:text-blue-400">
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