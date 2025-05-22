"use client"

import React, { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export function ArticlesHero() {
  const isMobile = useIsMobile();
  const [videoError, setVideoError] = useState(false);
  
  // Define video sources with multiple formats for better browser support
  const videoSources = {
    mobile: {
      webm: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/videos/backgrounds/water.webm",
      mp4: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/videos/backgrounds/water.mp4"
    },
    desktop: {
      webm: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/videos/backgrounds/water.webm", 
      mp4: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1/videos/backgrounds/water.mp4"
    }
  };

  // Fallback image if video fails to load
  const fallbackImage = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1/videos/backgrounds/water.jpg";

  const handleVideoError = () => {
    console.log("Articles video failed to load, showing fallback");
    setVideoError(true);
  };

  const currentSources = isMobile ? videoSources.mobile : videoSources.desktop;

  return (
    <section className="relative w-full overflow-hidden bg-black h-[70vh] md:h-[40vh] pt-16">
      {/* Video/Image background */}
      <div className="absolute inset-0">
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
      
      {/* Simple hero content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-white max-w-3xl">
            <p className="mb-2 text-sm font-cerebri font-normal uppercase tracking-wide text-white">LEARN</p>
            <h1 className="mb-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight font-serif">Articles & Resources</h1>
            <div className="space-y-6 text-base font-light">
              <p className="text-white/90 max-w-3xl">
                Discover the latest news, educational content, and resources about aesthetic procedures, dermatology treatments, and wellness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 