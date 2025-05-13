"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

export function FunctionalMedicineSection() {
  const isMobile = useIsMobile();
  
  // Full Cloudinary URL for the image
  const imageUrl = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741816689/main-page/sections/functional-medicine-section/3R8A0702.jpg";

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <Image 
            src={imageUrl} 
            alt="Functional Medicine at Allure MD" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="w-full h-full object-cover"
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
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Functional Medicine</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              A holistic approach to health and wellness
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our functional medicine approach targets the root cause of health concerns rather than just treating symptoms.
                Through comprehensive testing and personalized protocols, we address hormonal imbalances, gut health,
                nutritional deficiencies, and other factors that influence your overall wellbeing.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Dr. Gidwani</LearnMoreButton>
              <br />
              <LearnMoreButton href="/services/functional-medicine">Explore Functional Medicine Services</LearnMoreButton>
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
        <Image
          src={imageUrl}
          alt="Functional Medicine at Allure MD"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Dark gradient overlay that fades from right to left for text on the right */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 py-32 lg:px-8 lg:py-48 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="ml-auto max-w-2xl text-right"
        >
          <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Functional Medicine</h2>
          <h3 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight font-serif text-white mb-8">
            A holistic approach to health and wellness
          </h3>
          <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
            <p>
              Our functional medicine approach targets the root cause of health concerns rather than just treating symptoms.
              Through comprehensive testing and personalized protocols, we address hormonal imbalances, gut health,
              nutritional deficiencies, and other factors that influence your overall wellbeing.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            <LearnMoreButton href="/team">Meet Dr. Gidwani</LearnMoreButton>
            <br />
            <LearnMoreButton href="/services/functional-medicine">Explore Functional Medicine Services</LearnMoreButton>
            <br />
            <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
