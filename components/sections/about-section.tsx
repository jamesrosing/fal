"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

export function AboutSection() {
  return (
    <section className="relative min-h-screen bg-[#f5f5f5] dark:bg-black">
      <div className="container mx-auto px-4 py-24 lg:px-8">
        <motion.div className="max-w-3xl">
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">About Us</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Setting new standards in aesthetic medicine
          </h3>
          <div className="space-y-4 text-lg font-cerebri font-light">
            <p>
              At Allure MD, we bring together the expertise of board-certified physicians, skilled medical professionals,
              and experienced aestheticians.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div>
                <h4 className="mb-2 text-2xl font-normal">15+</h4>
                <p className="text-gray-300">Years of Combined Experience</p>
              </div>
              <div>
                <h4 className="mb-2 text-2xl font-normal">5,000+</h4>
                <p className="text-gray-300">Satisfied Patients</p>
              </div>
            </div>
            <div className="space-y-4">
              <LearnMoreButton href="/about">Learn More About Us</LearnMoreButton>
              <br />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

