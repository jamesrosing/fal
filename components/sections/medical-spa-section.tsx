"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useState } from "react"

export function MedicalSpaSection() {
  const [activeTab, setActiveTab] = useState<string | null>(null)

  return (
    <section className="relative min-h-screen bg-[#f5f5f5] dark:bg-black">
      <div className="absolute inset-0">
        <Image
          src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133483/procedures/julia%2520oxygeneo%2520facial%2520procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.png"
          alt="Medical spa treatment"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:max-w-[50%]"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Medical Spa</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Rejuvenate your natural beauty
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>
              Experience the perfect blend of luxury and medical expertise. Our medical spa offers advanced treatments
              including Emsculpt, RF microneedling, cosmetic injections, and professional skincare services, all in a
              serene, spa-like setting.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/medical-spa">Medical Spa Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Book a Treatment</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex">
        {["Facial Treatments", "Body Contouring", "Cosmetic Injections"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-6 text-center text-white border-t border-white/30 backdrop-blur-sm transition-colors duration-300 ${
              activeTab === tab ? "bg-white/20" : "bg-transparent hover:bg-white/10"
            }`}
            onMouseEnter={() => setActiveTab(tab)}
            onMouseLeave={() => setActiveTab(null)}
          >
            <span className="font-figgins text-sm uppercase tracking-wider">{tab}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

