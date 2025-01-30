"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function DermatologySection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20skin%20examination-Jdk8aLXVjRXYUUjqB525YpkY7dPtI3.webp"
          alt="Dermatology examination"
          fill
          className="object-cover"
          sizes="100vw"
          priority
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
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Dermatology</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Advanced skincare solutions for lasting results
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>
              Our comprehensive dermatology services combine medical expertise with aesthetic precision. From skin cancer
              screenings to advanced treatments for acne, eczema, and other conditions, we provide personalized care for
              all your skin health needs.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/team">Meet Dr. Susan Pearose</LearnMoreButton>
              <br />
              <LearnMoreButton href="/dermatology">Explore Dermatology Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

