"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import CldImage from "@/components/media/CldImage"

export function DermatologySection() {
  const isMobile = useIsMobile();
  
  // Use direct Cloudinary public ID
  const backgroundPublicId = "homepage-dermatology-background";

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <CldImage 
            publicId={backgroundPublicId} 
            alt="Dermatology at Allure MD" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="w-full h-full object-cover"
            sizes="100vw"
            crop="fill"
            priority
            showLoading={true}
          />
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
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Dermatology</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Comprehensive care for all skin conditions
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our dermatology practice offers both medical and cosmetic services. From treatments for conditions like
                acne, eczema, and psoriasis to specialized care for aging skin and sun damage, our experts provide 
                personalized treatment plans for all skin types and concerns.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Our Dermatologists</LearnMoreButton>
              <br />
              <LearnMoreButton href="/services/dermatology">Explore Dermatology Services</LearnMoreButton>
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
        <CldImage
          publicId={backgroundPublicId}
          alt="Dermatology at Allure MD"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          sizes="100vw"
          crop="fill"
          priority
          showLoading={true}
        />
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 py-32 lg:px-8 lg:py-48 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Dermatology</h2>
          <h3 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight font-serif text-white mb-8">
            Comprehensive care for all skin conditions
          </h3>
          <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
            <p>
              Our dermatology practice offers both medical and cosmetic services. From treatments for conditions like
              acne, eczema, and psoriasis to specialized care for aging skin and sun damage, our experts provide 
              personalized treatment plans for all skin types and concerns.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            <LearnMoreButton href="/team">Meet Our Dermatologists</LearnMoreButton>
            <br />
            <LearnMoreButton href="/services/dermatology">Explore Dermatology Services</LearnMoreButton>
            <br />
            <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

