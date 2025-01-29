"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function CounterIntrusionSection() {
  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4th%20section%20on%20main%20page-VRlV3H76kW5k0IacykPTs7cR67rLm2.png"
          alt="Counter Intrusion"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      <div className="relative container mx-auto px-4 py-24 text-white lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <h2 className="mb-6 text-2xl">Counter Intrusion</h2>
          <p className="mb-8 text-lg leading-relaxed">
            Lattice automates the protection of both domestic and forward operating bases. Our family of systems saves
            crucial time by autonomously identifying and surfacing threats, freeing our personnel to do what they do
            best.
          </p>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex">
        <button className="flex-1 bg-black py-6 text-center text-white hover:bg-gray-900">Counter UAS</button>
        <button className="flex-1 bg-gray-200 py-6 text-center hover:bg-gray-300">Counter Intrusion</button>
        <button className="flex-1 bg-black py-6 text-center text-white hover:bg-gray-900">
          Maritime Counter Intrusion
        </button>
      </div>
    </section>
  )
}

