"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

export function DermatologySection() {
  const isMobile = useIsMobile();
  
  // Full Cloudinary URL for the image
  const imageUrl = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741814968/main-page/sections/dermatology-section/3R8A0834.jpg";

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <Image 
            src={imageUrl}
            alt="Dermatology at Allure MD" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="object-cover w-full h-full"
            sizes="100vw"
            priority
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
              Medical dermatology that gets results
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our medical dermatology services are designed to help you achieve and maintain healthy, beautiful skin. 
                From acne to rosacea, psoriasis to eczema, we diagnose and treat a wide range of skin conditions with 
                evidence-based approaches.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/services/dermatology">Our Dermatology Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/appointment">Schedule Your Visit</LearnMoreButton>
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
        <Image
          src={imageUrl}
          alt="Dermatology at Allure MD"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:max-w-[50%] flex flex-col min-h-[800px] justify-center"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-300">
            Dermatology
          </h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif text-white">
            Medical dermatology that gets results
          </h3>
          <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
            <p>
              Our medical dermatology services are designed to help you achieve and maintain healthy, beautiful skin. 
              From acne to rosacea, psoriasis to eczema, we diagnose and treat a wide range of skin conditions with 
              evidence-based approaches.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/services/dermatology">Our Dermatology Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/appointment">Schedule Your Visit</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

