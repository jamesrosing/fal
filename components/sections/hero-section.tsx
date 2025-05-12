"use client"

import React from "react"
import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import { useIsMobile } from "@/hooks/use-mobile"

export function HeroSection() {
  const isMobile = useIsMobile();
  
  // Define video public IDs
  const mobileVideoId = "emsculpt/videos/hero/hero-480p-mp4";
  const desktopVideoId = "emsculpt/videos/hero/hero-720p-mp4";
  
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-screen video container - Using conditional rendering based on device */}
      <div className="absolute inset-0 w-full h-full">
        {isMobile ? (
          // Mobile Video Player
          <div className="absolute inset-0">
            <CldVideoPlayer
              id="hero-video-mobile"
              src={mobileVideoId}
              width="480"
              height="854"
              autoplay={true}
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
        ) : (
          // Desktop Video Player
          <div className="absolute inset-0">
            <CldVideoPlayer
              id="hero-video-desktop"
              src={desktopVideoId}
              width="1920" 
              height="1080"
              autoplay={true}
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
        )}
        
        {/* Global styling for the video player to ensure it fills the screen */}
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
        `}</style>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Content Container */}
      <div className="relative h-screen flex items-center">
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
