"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from '@/components/shared/ui/button'
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import CldVideo from '@/components/shared/media/CldVideo'
import CldImage from '@/components/shared/media/CldImage'
import { Skeleton } from '@/components/shared/ui/skeleton'

export function Hero() {
  const isMobile = useIsMobile();
  
  // Choose the appropriate video based on device
  const videoPublicId = isMobile 
    ? "emsculpt/videos/hero/hero-480p-mp4" 
    : "emsculpt/videos/hero/hero-720p-mp4";

  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      {/* Background Video */}
      <div className="absolute inset-0 bg-black">
        <CldVideo 
          publicId={videoPublicId}
          src={videoPublicId}
          autoplay={true}
          loop={true}
          muted={true}
          controls={false}
          className="object-cover w-full h-full"
          width={1920}
          height={1080}
          showLoading={false}
          config={{
            cloud: {
              cloudName: 'dyrzyfg3w'
            }
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </CldVideo>
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
    publicId?: string;
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
  const [publicId, setPublicId] = React.useState<string | null>(image.publicId || null);
  const [isLoading, setIsLoading] = React.useState<boolean>(publicId ? false : true);
  const [error, setError] = React.useState<boolean>(false);
  
  // Define the function outside useEffect to avoid strict mode issues
  async function fetchPublicId(imagePath: string) {
    try {
      const response = await fetch(`/api/media/${imagePath}`);
      if (response.ok) {
        const data = await response.json();
        if (data.public_id || data.publicId) {
          setPublicId(data.public_id || data.publicId);
          setIsLoading(false);
        } else {
          // No valid publicId found
          setError(true);
          setIsLoading(false);
        }
      } else {
        // API error
        setError(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching public ID for ${imagePath}:`, error);
      setError(true);
      setIsLoading(false);
    }
  }
  
  // Fetch the public ID for the image path if not provided
  React.useEffect(() => {
    if (!publicId && !error) {
      fetchPublicId(image.path);
    }
  }, [image.path, publicId, error]);
  
  return (
    <section className="relative h-screen">
      <div className="absolute inset-0">
        {isLoading ? (
          <Skeleton 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : publicId ? (
          <CldImage 
            src={publicId}
            alt={image.alt}
            width={1920}
            height={1080} 
            className="absolute inset-0 w-full h-full object-cover"
            priority
            sizes="100vw"
            config={{
              cloud: {
                cloudName: 'dyrzyfg3w'
              }
            }}
          />
        ) : (
          // Fallback image when no publicId is available
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Image not available</span>
          </div>
        )}
        {/* Gradient overlay: clearer on left, more opaque on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-black/70" />
      </div>
      
      {/* Mobile Hero with Image on top + Text below */}
      <div className="lg:hidden">
        {/* Media container with full width */}
        <div className="relative w-full aspect-[16/9]">
          {isLoading ? (
            <Skeleton 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : publicId ? (
            <CldImage 
              src={publicId}
              alt={image.alt}
              width={1920}
              height={1080} 
              className="absolute inset-0 w-full h-full object-cover"
              priority
              sizes="100vw"
              config={{
                cloud: {
                  cloudName: 'dyrzyfg3w'
                }
              }}
            />
          ) : (
            // Fallback image when no publicId is available
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
          {/* Gradient overlay: clearer on left, more opaque on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-black/70" />
        </div>
        
        {/* Text content below image */}
        <div className="px-4 py-10 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {subtitle && (
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                {subtitle}
              </h1>
            )}
            <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              {title}
            </h2>
            {description && (
              <div className="space-y-6 text-base font-cerebri font-light">
                <p>{description}</p>
                <div className="space-y-4">
                  {children}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Desktop Hero with Text over Image */}
      <div className="hidden lg:block relative h-screen">
        <div className="absolute inset-0">
          {isLoading ? (
            <Skeleton 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : publicId ? (
            <CldImage 
              src={publicId}
              alt={image.alt}
              width={1920}
              height={1080} 
              className="absolute inset-0 w-full h-full object-cover"
              priority
              sizes="100vw"
              config={{
                cloud: {
                  cloudName: 'dyrzyfg3w'
                }
              }}
            />
          ) : (
            // Fallback image when no publicId is available
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Image not found</span>
            </div>
          )}
          {/* Gradient overlay from left to right - clearer on left, more opaque on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/70" />
        </div>
        
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                {subtitle}
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                {title}
              </h2>
              <div className="space-y-6 text-base font-cerebri font-light">
                <p>
                  {description}
                </p>
                <div className="space-y-4">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

