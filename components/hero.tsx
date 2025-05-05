"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BackgroundVideo } from "@/components/ui/background-video"
import Link from "next/link"
import { getCloudinaryUrl, getCloudinaryVideoUrl } from "@/lib/cloudinary"
import Image from 'next/image'
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


// TODO: Replace these URLs with your CDN URLs
// Recommended: Use a CDN service like Cloudinary, Bunny.net, or Amazon S3 + CloudFront
// Example CDN URL structure: https://your-cdn.com/videos/allure-md/hero-720p.webm
const videoSources = [
  {
    src: getCloudinaryVideoUrl("emsculpt/videos/hero/hero-720p-mp4", {
      format: "mp4",
      width: 1280,
      quality: 90
    }),
    type: "video/mp4",
  },
  {
    src: getCloudinaryVideoUrl("emsculpt/videos/hero/hero-720p-webm", {
      format: "webm",
      width: 1280,
      quality: 90
    }),
    type: "video/webm",
  },
]

// Define Cloudinary URLs for poster and fallback images
const posterImage = getCloudinaryUrl("hero/hero-poster", {
  width: 1920,
  height: 1080,
  crop: 'fill',
  gravity: 'auto',
  format: 'auto' as any,
  quality: 'auto' as any
});

const fallbackImage = getCloudinaryUrl("hero/hero-fallback", {
  width: 1920,
  height: 1080,
  crop: 'fill',
  gravity: 'auto',
  format: 'auto' as any,
  quality: 'auto' as any
});

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      <BackgroundVideo
        poster={posterImage}
        fallbackImage={fallbackImage}
        sources={videoSources}
        className="object-cover"
      />

      <div className="relative h-full flex items-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="hero-text mb-6">Advanced Aesthetic Medicine</h1>
            <p className="hero-tagline text-xl sm:text-2xl mb-8 text-gray-200">Where artistry meets science</p>
            <Link href="/appointment">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-black transition-colors bg-transparent"
              >
                Schedule Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}

// PageHero component merged into this file
interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: {
    path: string;
    alt: string;
  };
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  description,
  image,
  children
}: PageHeroProps) {
  // Handle full URLs or just public IDs
  const imageUrl = image.path.includes('https://res.cloudinary.com') 
    ? image.path 
    : getCloudinaryUrl(image.path, {
        format: 'auto' as any,
        quality: 'auto' as any
      });

  return (
    <section className="relative pt-20">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={imageUrl}
          alt={image.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      
      <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl text-white"
        >
          {subtitle && (
            <p className="text-lg md:text-xl font-serif mb-2 text-gray-300">{subtitle}</p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-gray-200 mb-6">{description}</p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}

