"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import { useIsMobile } from "@/hooks/use-mobile"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export function FunctionalMedicineSection() {
  const isMobile = useIsMobile();
  
  // Use the useMediaAsset hook to get the media url
  const { url: backgroundUrl, isVideo, isLoading } = useMediaAsset('homepage-functional-medicine-background', {
    width: 1920,
    quality: 80,
    format: 'auto',
    responsive: true
  });

  // Display loading placeholder if media is still loading
  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </section>
    );
  }

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
              alt="Dr. Gidwani consulting with patient" 
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
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Functional Medicine</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Optimize your health from within
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Led by Dr. Pooja Gidwani, our functional medicine approach addresses the root causes of health concerns,
                optimizing everything from hormone balance to cognitive performance.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/functional-medicine">Learn Functional Medicine</LearnMoreButton>
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
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            src={backgroundUrl || ""}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <Image
            src={backgroundUrl || ""}
            alt="Dr. Gidwani consulting with patient"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        )}
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Text Content - Desktop */}
      <div className="relative container mx-auto px-4 py-24 lg:px-8 min-h-screen flex items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Functional Medicine</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Optimize your health from within
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>
              Led by Dr. Pooja Gidwani, our functional medicine approach addresses the root causes of health concerns,
              optimizing everything from hormone balance to cognitive performance.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/functional-medicine">Learn Functional Medicine</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
