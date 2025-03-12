"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"

export function MedicalSpaSection() {
  // Use the useMediaAsset hook to get the image url
  const { url: backgroundImageUrl } = useMediaAsset('homepage-medical-spa-background', {
    width: 1920,
    quality: 80
  });

  return (
    <section className="relative min-h-screen bg-white">
      <div className="absolute inset-0">
        <Image
          src={backgroundImageUrl || "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133484/services/medical-spa/medical%2520spa%2520services-bRH7XmPsnxZZx8xpgKMGE6Gq8U7XTw.png"}
          alt="Medical Spa Services"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative container mx-auto px-4 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:max-w-[50%] lg:ml-auto text-white"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Medical Spa</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Rejuvenation treatments for face and body
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>
              Our medical spa combines luxury with clinical excellence. Enjoy targeted treatments like chemical peels,
              microneedling, and advanced facials customized for your unique skin needs, all in a serene, spa-like setting.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/medical-spa">Explore Medical Spa Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

