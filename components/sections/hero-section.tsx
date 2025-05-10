"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import { getCloudinaryPublicId } from '@/lib/cloudinary'
import { useIsMobile } from "@/hooks/use-mobile"

export function HeroSection() {
  const isMobile = useIsMobile();
  
  // Direct Cloudinary video public IDs
  const videoPublicId = isMobile 
    ? "emsculpt/videos/hero/hero-480p-mp4" 
    : "emsculpt/videos/hero/hero-720p-mp4";

  return (
    <section className="relative min-h-screen bg-black">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Standard Cloudinary Video Player */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          <CldVideoPlayer
            src={videoPublicId}
            width="100%"
            height="100%"
            autoplay ={true}
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
            Elevate your natural beauty with expert care
          </h1>
          <div className="space-y-6 text-lg font-light">
            <p>
              Experience the perfect blend of medical expertise and aesthetic artistry at Allure MD. Our team of board-certified
              physicians and skilled practitioners are dedicated to helping you achieve your aesthetic goals with personalized
              treatments and exceptional care.
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
