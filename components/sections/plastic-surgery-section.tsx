"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function PlasticSurgerySection() {
  return (
    <section className="relative h-screen">
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Allure%20MD%20Plastic%20Surgery%20+%20Dermatology.jpg-F9audkfbyoMRm8Bj6ss2sCa26IEGeK.jpeg"
          alt="Plastic Surgery at Allure MD"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
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