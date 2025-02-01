"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function FunctionalMedicineSection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="relative flex flex-col lg:flex-row">
        {/* Text Content - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="lg:hidden w-full px-4 py-12 bg-black"
        >
          <div className="max-w-3xl">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Functional Medicine</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Optimize your health from within
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Led by Dr. Pooja Gidwani, our functional medicine approach addresses the root causes of health concerns,
                optimizing everything from hormone balance to cognitive performance.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/functional-medicine">Learn Functional Medicine</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Image Container */}
        <div className="w-full h-[40vh] lg:h-screen relative overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dr.%20pooja%20gidwani%20functional%20medicine-Bu2sPZSjIHB98KY4WsMna2D9ii12tL.webp"
            alt="Dr. Gidwani consulting with patient"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Text Content - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="hidden lg:flex w-full lg:w-1/2 absolute inset-y-0 left-0 bg-black/70 flex-col justify-center"
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl lg:pl-[8.33%]">
              <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Functional Medicine</h2>
              <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
                Optimize your health from within
              </h3>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Led by Dr. Pooja Gidwani, our functional medicine approach addresses the root causes of health concerns,
                  optimizing everything from hormone balance to cognitive performance.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/functional-medicine">Learn Functional Medicine</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
