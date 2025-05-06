"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import CloudinaryVideo from '@/components/media/CloudinaryVideo'
import UnifiedMedia from '@/components/media/UnifiedMedia'

export function Hero() {
  const isMobile = useIsMobile();
  
  // Choose the appropriate video based on device
  const videoPublicId = isMobile 
    ? "emsculpt/videos/hero/hero-480p-mp4" 
    : "emsculpt/videos/hero/hero-720p-mp4";
  
  // Poster image for the video
  const posterPublicId = "hero/hero-poster";

  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      {/* Background Video */}
      <div className="absolute inset-0 bg-black">
        <CloudinaryVideo
          publicId={videoPublicId}
          poster={posterPublicId}
          autoPlay={true}
          loop={true}
          muted={true}
          controls={false}
          className="object-cover w-full h-full"
          preload="auto"
          formats={['mp4']}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Overlay */}
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

      {/* Scroll Indicator */}
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
  return (
    <section className="relative pt-20">
      <div className="relative aspect-[16/9] w-full">
        <UnifiedMedia
          placeholderId={image.path}
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

