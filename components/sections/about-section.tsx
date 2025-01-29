"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

export function AboutSection() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/allure%20md%20team-Mm8n4OeNEk3cLrCdTqWLilNVaMKAIB.webp"
          alt="Allure MD Team"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
      </div>
      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-end pb-12 sm:pb-16 md:pb-20 lg:pb-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="mb-4 text-2xl">About Us</h2>
          <h3 className="mb-8 text-4xl font-bold sm:text-5xl md:text-6xl">A Team Dedicated to Your Care</h3>
          <p className="mb-12 text-lg leading-relaxed">
            At Allure MD, we bring together the expertise of board-certified physicians, skilled medical professionals,
            and experienced aestheticians. Our collaborative approach ensures that you receive comprehensive care
            tailored to your unique needs and goals.
          </p>
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div>
              <h4 className="mb-2 text-2xl font-bold">15+</h4>
              <p className="text-gray-300">Years of Combined Experience</p>
            </div>
            <div>
              <h4 className="mb-2 text-2xl font-bold">5,000+</h4>
              <p className="text-gray-300">Satisfied Patients</p>
            </div>
          </div>
          <LearnMoreButton href="/about" className="text-lg">
            Learn More About Us
          </LearnMoreButton>
        </motion.div>
      </div>
    </section>
  )
}

