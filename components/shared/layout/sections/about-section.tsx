"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

export function AboutSection() {
  const isMobile = useIsMobile();
  
  // Full Cloudinary URL for the image
  const imageUrl = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1739333317/home/hero/hero-about.jpg";
  
  // Mobile Layout: Text above, image below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Mobile Text Content */}
        <div className="px-4 py-12 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto"
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">About Us</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Setting new standards in aesthetic medicine
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                At Allure MD, we bring together the expertise of board-certified physicians, skilled medical professionals,
                and experienced aestheticians.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/about">Learn More About Us</LearnMoreButton>
              <br />
              <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </motion.div>
        </div>

        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={imageUrl}
            alt="Allure MD Medical Team"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
            sizes="100vw"
            priority
          />
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </section>
    );
  }

  // Desktop Layout
  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Desktop Background Media */}
      <div className="absolute inset-0 group">
        <Image
          src={imageUrl}
          alt="Allure MD Medical Team"
          fill
          className="object-cover object-[center_15%]"
          sizes="100vw"
          priority
        />
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Desktop Text Content */}
      <div className="relative container mx-auto px-4 min-h-screen flex items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-[50%] text-white py-24"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">About Us</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Setting new standards in aesthetic medicine
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>
              At Allure MD, we bring together the expertise of board-certified physicians, skilled medical professionals,
              and experienced aestheticians.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/about">Learn More About Us</LearnMoreButton>
              <br />
              <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
