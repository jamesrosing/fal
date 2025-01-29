"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function TeamSection() {
  return (
    <section className="relative min-h-screen bg-black">
      <div className="container mx-auto flex min-h-screen flex-col lg:flex-row">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 flex flex-col justify-center px-4 py-24 text-white lg:w-1/2 lg:px-8"
        >
          <h2 className="mb-4 text-xl">Our Team</h2>
          <h3 className="mb-8 text-4xl font-bold md:text-5xl">Expert care from trusted professionals</h3>
          <p className="mb-8 text-lg leading-relaxed">
            Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
            decades of combined experience in aesthetic medicine. We&apos;re committed to delivering exceptional results
            while ensuring your comfort and safety.
          </p>
          <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
        </motion.div>

        {/* Right side - Team photos grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-2 gap-1 lg:w-1/2"
        >
          {/* Top row */}
          <div className="relative h-full">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr_James_Rosing_white_bg-5w4lH8VlTQFJUoq0ggd5Y9dFbESMHJ.png"
              alt="Dr. James Rosing"
              fill
              className="object-cover object-[center_15%]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative h-full">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-Jsjg50FwPodXo3xuTN7sv0WlGo63gL.webp"
              alt="Dr. Susan Pearose"
              fill
              className="object-cover object-[center_15%]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          {/* Bottom row */}
          <div className="relative h-full">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetican%20headshot-ogGKpiWSQrqW5Z4sv9pf1kiyuctPTJ.webp"
              alt="Julia, Medical Esthetician"
              fill
              className="object-cover object-[center_15%]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative h-full">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pooja%20gidwani%20md%20functional%20medince%20headshot-yNLxeL8rTQtSRlD1g9kR6ZZFgiZoKR.webp"
              alt="Dr. Pooja Gidwani"
              fill
              className="object-cover object-[center_15%]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

