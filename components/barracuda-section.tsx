"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function BarracudaSection() {
  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5th%20section%20main%20page-PJ3BAQyyjVTxoDXlec4AqwqrjMsGdi.png"
          alt="Barracuda"
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
          <h2 className="mb-4 text-2xl">Barracuda</h2>
          <h3 className="mb-8 text-5xl font-bold md:text-6xl">Purpose-Built to Bring Mass to the Fight</h3>
          <p className="mb-12 text-lg leading-relaxed">
            Barracuda is a family of air-breathing Autonomous Air Vehicles (AAVs) purpose-built for hyper-scale
            production and mass employment. Barracuda-M is the munition configuration of Barracuda that delivers a more
            affordable, producible, available, and adaptable cruise missile capability than existing options available
            to warfighters today.
          </p>
          <LearnMoreButton href="/products/barracuda">Learn More About Barracuda</LearnMoreButton>
        </motion.div>
      </div>
    </section>
  )
}

