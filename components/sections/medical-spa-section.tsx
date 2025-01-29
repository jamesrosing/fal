"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useState } from "react"

export function MedicalSpaSection() {
  const [activeTab, setActiveTab] = useState<string | null>(null)

  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp"
          alt="Medical spa treatment"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="mb-4 text-2xl text-white">Medical Spa</h2>
          <h3 className="mb-8 text-5xl font-bold md:text-6xl text-white">Advanced Aesthetic Treatments</h3>
          <p className="mb-12 text-lg leading-relaxed text-white">
            Experience the perfect blend of luxury and medical expertise. Our medical spa offers advanced treatments
            including Emsculpt, RF microneedling, cosmetic injections, and professional skincare services, all in a
            serene, spa-like setting.
          </p>
          <LearnMoreButton href="/medical-spa">Discover Our Treatments</LearnMoreButton>
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

