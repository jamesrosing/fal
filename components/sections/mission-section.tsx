"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import { useIsMobile } from "@/hooks/use-mobile"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export function MissionSection() {
  const isMobile = useIsMobile();
  
  // Use the useMediaAsset hook to fetch the media with improved quality
  const { url: backgroundUrl, isVideo, isLoading } = useMediaAsset('homepage-mission-background', {
    width: isMobile ? 1080 : 1920, // Higher resolution for mobile
    quality: 90, // Increased quality
    format: 'webp', // Explicitly use webp for better compression/quality ratio
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
          {isVideo && backgroundUrl ? (
            <video
              src={backgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : backgroundUrl ? (
            <Image 
              src={backgroundUrl} 
              alt="Mission background" 
              fill 
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <p className="text-gray-500">Image not available</p>
            </div>
          )}
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        {/* Text content below image - separate from media overlay */}
        <div className="px-4 py-12 bg-black"> 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto"
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">OUR MISSION</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Transforming lives through advanced aesthetic medicine
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>Beauty and wellness have evolved. How we approach aesthetic enhancement needs to evolve too.</p>
              <p>
                At Allure MD, we combine cutting-edge technology with artistic vision to deliver natural-looking results
                that enhance your unique beauty. Our comprehensive approach integrates plastic surgery, dermatology,
                medical spa treatments, and functional medicine to achieve optimal outcomes.
              </p>
            </div>
            <div className="mt-8">
              <LearnMoreButton href="/about">Learn more about our approach</LearnMoreButton>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Desktop Layout: Text over background with gradient
  return (
    <section className="relative bg-black text-white">
      {/* Add background media with dark overlay */}
      <div className="absolute inset-0 z-0">
        {isVideo && backgroundUrl ? (
          <video
            src={backgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : backgroundUrl ? (
          <Image 
            src={backgroundUrl} 
            alt="Mission background" 
            fill 
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">Image not available</p>
          </div>
        )}
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 py-32 lg:px-8 lg:py-48 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">OUR MISSION</h2>
          <h3 className="text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight font-serif text-white mb-10">
            Transforming lives through advanced aesthetic medicine
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light text-gray-200">
            <p>Beauty and wellness have evolved. How we approach aesthetic enhancement needs to evolve too.</p>
            <p>
              At Allure MD, we combine cutting-edge technology with artistic vision to deliver natural-looking results
              that enhance your unique beauty. Our comprehensive approach integrates plastic surgery, dermatology,
              medical spa treatments, and functional medicine to achieve optimal outcomes.
            </p>
          </div>
          <div className="mt-10">
            <LearnMoreButton href="/about">Learn more about our approach</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

