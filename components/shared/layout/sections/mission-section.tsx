"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import CldImage from '@/components/shared/media/CldImage'

export function MissionSection() {
  const isMobile = useIsMobile();
  
  // Directly use a Cloudinary public ID instead of useMediaAsset hook
  const backgroundPublicId = "homepage-mission-background"; // This should be updated with the actual public ID
  
  // Mobile Layout: Only text content with reduced padding
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Text content with reduced padding */}
        <div className="px-4 py-10 bg-black"> 
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

  // Desktop Layout: Just text content with reduced padding
  return (
    <section className="bg-black text-white">
      <div className="container mx-auto px-4 py-16 lg:px-8 lg:py-24">
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
          <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
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

