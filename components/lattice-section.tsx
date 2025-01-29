"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function LatticeSection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3rd%20section%20on%20main%20page-KBsDLXToT6DjsmhSedlugY9naffWWl.png"
          alt="Lattice background"
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
          <h2 className="mb-4 text-2xl">Lattice</h2>
          <h3 className="mb-8 text-5xl font-bold md:text-6xl">Autonomy for Every Mission</h3>
          <p className="mb-12 text-lg leading-relaxed">
            Anduril's family of systems is powered by Lattice, an AI-powered, open operating system that brings autonomy
            to defense's toughest missions. Lattice connects autonomous sensemaking and command & control capabilities
            with open, modular, and scalable hardware components for a layered family of systems approach.
          </p>
          <div className="space-y-4">
            <LearnMoreButton href="/lattice/sdk">Start Building with Lattice SDK</LearnMoreButton>
            <br />
            <LearnMoreButton href="/lattice/mesh">Learn More about Lattice Mesh</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

