"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import { useIsMobile } from "@/hooks/use-mobile"

export function PlasticSurgerySection() {
  const isMobile = useIsMobile();
  
  // Use the useMediaAsset hook to get the media url with responsive options
  const { url: backgroundUrl, srcSet, isVideo, isLoading } = useMediaAsset('homepage-plastic-surgery-background', {
    width: 1920,
    quality: 80,
    format: 'auto',
    responsive: true
  });

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          {isVideo ? (
            <video
              src={backgroundUrl || ""}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image 
              src={backgroundUrl || ""} 
              alt="Plastic Surgery at Allure MD" 
              fill 
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        {/* Text content below image */}
        <div className="px-4 py-12 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto"
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Plastic Surgery</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Trusted expertise in aesthetic medicine
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our team of board-certified physicians and licensed medical professionals brings decades of combined
                experience in aesthetic medicine. We stay at the forefront of medical advances to provide you with the
                safest, most effective treatments available.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Dr. James Rosing</LearnMoreButton>
              <br />
              <LearnMoreButton href="/plastic-surgery">Explore Plastic Surgery Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Desktop Layout
  return (
    <section className="relative h-screen bg-black text-white">
      <div className="absolute inset-0">
        {isVideo ? (
          // Render video background when the asset is a video
          <video
            src={backgroundUrl || ""}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          // Render image background when the asset is an image
          <Image
            src={backgroundUrl || ""}
            alt="Plastic Surgery at Allure MD"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="relative h-full flex items-end">
        <div className="container mx-auto px-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl text-white"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Plastic Surgery
            </h2>
            <h3 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              Trusted expertise in aesthetic medicine
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our team of board-certified physicians and licensed medical professionals brings decades of combined
                experience in aesthetic medicine. We stay at the forefront of medical advances to provide you with the
                safest, most effective treatments available.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Dr. James Rosing</LearnMoreButton>
                <br />
                <LearnMoreButton href="/plastic-surgery">Explore Plastic Surgery Services</LearnMoreButton>
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