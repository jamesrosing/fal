"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import CldImage from '@/components/media/CldImage'
import CldVideo from '@/components/media/CldVideo'
import { getCloudinaryPublicId } from '@/lib/cloudinary'

export function HeroSection() {
  // Use useMediaAsset hook for hero background
  const { url: heroBackgroundUrl, isVideo, publicId } = useMediaAsset('homepage-hero-background', {
    width: 1920,
    quality: 90,
    format: 'auto',
    responsive: true
  });
  
  // Extract Cloudinary public ID from URL if available
  const cloudinaryId = publicId || (heroBackgroundUrl ? getCloudinaryPublicId(heroBackgroundUrl) : null);

  return (
    <section className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        {isVideo && cloudinaryId ? (
          // Render video background using CldVideo when the asset is a video
          <CldVideo
            publicId={cloudinaryId}
            autoPlay={true}
            loop={true}
            muted={true}
            controls={false}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            showLoading={false}
          />
        ) : cloudinaryId ? (
          // Render image background using CldImage when the asset is an image
          <CldImage
            publicId={cloudinaryId}
            alt="Allure MD Hero Background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : heroBackgroundUrl ? (
          // Fallback to regular image or video if not a Cloudinary asset
          isVideo ? (
            <video
              src={heroBackgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={heroBackgroundUrl}
              alt="Allure MD Hero Background"
              className="w-full h-full object-cover"
            />
          )
        ) : null}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:max-w-[50%] text-white"
        >
          <h1 className="mb-8 text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight font-serif">
            Elevate your natural beauty with expert care
          </h1>
          <div className="space-y-6 text-lg font-cerebri font-light">
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