"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"

const galleryImages = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-1.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-2.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-3.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-4.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-5.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-image-6.webp"
]

export default function Gallery() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gallery-hero.webp"
            alt="Gallery at Allure MD"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Gallery
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Before & After Transformations
              </h2>
              <p className="text-lg font-cerebri font-light">
                Explore our gallery to see the stunning transformations achieved by our expert team at Allure MD.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative aspect-[4/3] w-full overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`Gallery Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 