"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import { useIsMobile } from "@/hooks/use-mobile"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroSection() {
  const isMobile = useIsMobile();
  
  // Define video paths and fallback direct publicIds
  const defaultVideoPath = isMobile ? "videos/hero/mobile" : "videos/hero/desktop";
  const fallbackPublicId = isMobile 
    ? "emsculpt/videos/hero/hero-480p-mp4" 
    : "emsculpt/videos/hero/hero-720p-mp4";
  
  // State management for API resolution
  const [publicId, setPublicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Define the function to fetch publicId from path
  async function fetchPublicId(videoPath: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/media/${videoPath}`);
      if (response.ok) {
        const data = await response.json();
        if (data.public_id || data.publicId) {
          setPublicId(data.public_id || data.publicId);
          setIsLoading(false);
        } else {
          // No valid publicId found, use fallback
          console.warn(`No valid publicId found for ${videoPath}, using fallback`);
          setPublicId(fallbackPublicId);
          setIsLoading(false);
        }
      } else {
        // API error, use fallback
        console.warn(`API error for ${videoPath}, using fallback`);
        setPublicId(fallbackPublicId);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching public ID for ${videoPath}:`, error);
      setPublicId(fallbackPublicId);
      setIsLoading(false);
    }
  }
  
  // Fetch the public ID on component mount
  useEffect(() => {
    fetchPublicId(defaultVideoPath);
  }, [defaultVideoPath]);

  return (
    <section className="relative min-h-screen bg-black">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {isLoading ? (
          // Show skeleton while loading
          <div className="absolute inset-0 bg-gray-900">
            <Skeleton className="w-full h-full" />
          </div>
        ) : publicId ? (
          // Show video player when publicId is available
          <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
            <CldVideoPlayer
              src={publicId}
              width="100%"
              height="100%"
              autoplay={true}
              muted={true}
              loop={true}
              controls={false}
              transformation={{
                width: 1920,
                height: 1080,
                crop: "fill",
                gravity: "auto",
                quality: "auto"
              }}
            />
          </div>
        ) : (
          // Fallback when there's an error and no publicId
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <span className="text-gray-400">Video not available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Content Container - Left-aligned */}
      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-center items-start lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:max-w-[50%] text-white text-left"
        >
          <h1 className="mb-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight font-light">
            Advanced Aesthetic Medicine
          </h1>
          <div className="space-y-6 text-lg font-light">
            <p>
              Where artistry meets science
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/about">About Allure MD</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 
