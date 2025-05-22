"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"

export function HeroSection() {
  const isMobile = useIsMobile();
  const [videoError, setVideoError] = useState(false);
  
  // Define video sources with multiple formats for better browser support
  const videoSources = {
    mobile: {
      webm: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/emsculpt/videos/hero/hero-480p-webm",
      mp4: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/emsculpt/videos/hero/hero-480p-mp4"
    },
    desktop: {
      webm: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/emsculpt/videos/hero/hero-720p-webm", 
      mp4: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/emsculpt/videos/hero/hero-720p-mp4"
    }
  };

  // Fallback image if video fails to load
  const fallbackImage = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1/hero/hero-fallback.jpg";

  const handleVideoError = () => {
    console.log("Video failed to load, showing fallback");
    setVideoError(true);
  };

  const currentSources = isMobile ? videoSources.mobile : videoSources.desktop;
  
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-screen video/image background */}
      <div className="absolute inset-0 w-full h-full">
        {!videoError ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onError={handleVideoError}
            style={{
              objectPosition: 'center',
              zIndex: 1
            }}
          >
            {/* WebM source for better compression and quality */}
            <source src={currentSources.webm} type="video/webm" />
            {/* MP4 fallback for broader browser support */}
            <source src={currentSources.mp4} type="video/mp4" />
            
            {/* If video fails completely, this text will show */}
            Your browser does not support the video tag.
          </video>
        ) : (
          /* Fallback image if video fails to load */
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${fallbackImage})`,
              zIndex: 1
            }}
          />
        )}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>
      
      {/* Content Container */}
      <div className="relative h-screen flex items-end pb-16 md:pb-20 z-20">
        <div className="container mx-auto px-4 lg:px-8">
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
      </div>
    </section>
  )
} 
