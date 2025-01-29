"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function DermatologySection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20skin%20examination-Jdk8aLXVjRXYUUjqB525YpkY7dPtI3.webp"
          alt="Dermatology examination"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative container mx-auto px-4 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="mb-4 text-2xl">Dermatology</h2>
          <h3 className="mb-8 text-5xl font-bold md:text-6xl">Advanced Skin Health Solutions</h3>
          <p className="mb-12 text-lg leading-relaxed">
            Our comprehensive dermatology services combine medical expertise with aesthetic precision. From skin cancer
            screenings to advanced treatments for acne, eczema, and other conditions, we provide personalized care for
            all your skin health needs.
          </p>
          <div className="space-y-4">
            <LearnMoreButton href="/dermatology">Explore Dermatology Services</LearnMoreButton>
            <br />
            <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

