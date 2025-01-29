"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function FunctionalMedicineSection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="relative min-h-screen bg-black text-white flex flex-col lg:flex-row">
        <div className="w-full h-[50vh] lg:h-screen relative overflow-hidden">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dr.%20pooja%20gidwani%20functional%20medicine-Bu2sPZSjIHB98KY4WsMna2D9ii12tL.webp"
            alt="Dr. Gidwani consulting with patient"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 py-12 lg:py-0 lg:pl-12 absolute inset-y-0 right-0 bg-black/70 flex flex-col justify-center"
        >
          <h2 className="mb-4 text-2xl">Functional Medicine</h2>
          <h3 className="mb-8 text-5xl font-bold md:text-6xl">Optimize Your Health</h3>
          <p className="mb-12 text-lg leading-relaxed">
            Led by Dr. Pooja Gidwani, our functional medicine approach addresses the root causes of health concerns,
            optimizing everything from hormone balance to cognitive performance. We create personalized treatment plans
            that enhance both your health and natural beauty.
          </p>
          <LearnMoreButton href="/functional-medicine">Learn More About Functional Medicine</LearnMoreButton>
        </motion.div>
      </div>
    </section>
  )
}

