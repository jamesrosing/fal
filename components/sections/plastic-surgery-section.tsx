"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import CldImage from "@/components/media/CldImage"

export function PlasticSurgerySection() {
  const isMobile = useIsMobile();
  
  // Directly use the provided Cloudinary public ID
  // Make sure to use the full public ID pattern including folder structure
  const backgroundPublicId = "t1qslw49kdlnmgoqst5h";

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <CldImage 
            publicId={backgroundPublicId} 
            alt="Plastic Surgery at Allure MD" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="object-cover w-full h-full"
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
              <LearnMoreButton href="/services/plastic-surgery">Explore Plastic Surgery Services</LearnMoreButton>
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
        <CldImage
          publicId={backgroundPublicId}
          alt="Plastic Surgery at Allure MD"
          width={1920}
          height={1080}
          className="object-cover w-full h-full"
          sizes="100vw"
          crop="fill"
          priority
          showLoading={true}
        />
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
            <div className="space-y-6 text-base font-cerebri font-light">
              <p>
                Our team of board-certified physicians and licensed medical professionals brings decades of combined
                experience in aesthetic medicine. We stay at the forefront of medical advances to provide you with the
                safest, most effective treatments available.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Dr. James Rosing</LearnMoreButton>
                <br />
                <LearnMoreButton href="/services/plastic-surgery">Explore Plastic Surgery Services</LearnMoreButton>
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