"use client"

import React from "react"
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import { useIsMobile } from "@/hooks/use-mobile"

export function ArticlesHero() {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: "25vh" }}>
      {/* Full-screen video container */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0">
          <CldVideoPlayer
            id="articles-hero-video"
            src="videos/backgrounds/water"
            width={isMobile ? "480" : "1920"}
            height={isMobile ? "854" : "1080"}
            autoplay={true}
            muted={true}
            loop={true}
            controls={false}
          />
        </div>
        
        {/* Global styling for the video player */}
        <style jsx global>{`
          /* Make video player container fill available space */
          .cld-video-player {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: hidden !important;
          }
          
          /* Make the actual video element cover the container */
          .cld-video-player video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          
          /* Ensure video.js elements don't break the layout */
          .cld-video-player .vjs-tech {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          
          /* Hide control bar completely */
          .cld-video-player .vjs-control-bar {
            display: none !important;
          }
          
          /* Ensure video wrapper takes full size */
          .cld-video-player-wrapper,
          .cld-video-player .vjs-tech,
          .cld-video-player .vjs-poster {
            width: 100% !important;
            height: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            object-fit: cover !important;
            background-size: cover !important;
          }
          
          /* Fix mobile specific issues */
          @media (max-width: 768px) {
            .cld-video-player,
            .cld-video-player video,
            .cld-video-player .vjs-tech {
              object-position: center !important;
            }
          }
          
          /* Override background for mobile menu button to remove shaded box */
          .md\\:hidden .bg-white\\/10 {
            background-color: transparent !important;
          }
        `}</style>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Content Container */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 pt-14 lg:px-8">
          <div className="w-full lg:max-w-[50%] text-white text-left">
            <h1 className="mb-3 md:mb-4 text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-tight font-light">
              Articles & Resources
            </h1>
            <div className="space-y-1 md:space-y-3 text-sm md:text-lg font-light">
              <p>Stay informed and educated</p>
              <p className="text-sm md:text-base opacity-80 max-w-2xl">
                Discover the latest news, educational content, and resources about aesthetic procedures, dermatology treatments, and wellness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 