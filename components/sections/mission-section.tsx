"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function MissionSection() {
  return (
    <section className="relative bg-[#f5f5f5] dark:bg-black">
      <div className="container mx-auto px-4 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:max-w-[50%]"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Our Mission</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Transforming lives through advanced aesthetic medicine
          </h3>
          <div className="space-y-6 text-lg font-cerebri font-light">
            <p>Beauty and wellness have evolved. How we approach aesthetic enhancement needs to evolve too.</p>
            <p>
              At Allure MD, we combine cutting-edge technology with artistic vision to deliver natural-looking results
              that enhance your unique beauty. Our comprehensive approach integrates plastic surgery, dermatology,
              medical spa treatments, and functional medicine to achieve optimal outcomes.
            </p>
          </div>
          <div className="mt-8">
            <LearnMoreButton href="/about">Learn more about our approach</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

