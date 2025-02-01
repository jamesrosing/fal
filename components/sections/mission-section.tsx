"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function MissionSection() {
  return (
    <section className="relative min-h-screen bg-[#f5f5f5] dark:bg-black">
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
      <div className="relative mt-16 h-[800px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Allure%20MD%20Plastic%20Surgery%20+%20Dermatology.jpg-F9audkfbyoMRm8Bj6ss2sCa26IEGeK.jpeg"
            alt="Doctor consulting with patient"
            fill
            className="object-cover object-center grayscale"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="container relative mx-auto px-4 py-24 text-white lg:px-8">
          <div className="w-full lg:max-w-[50%] flex flex-col min-h-[800px] justify-end">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Plastic Surgery</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Trusted expertise in aesthetic medicine
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our team of board-certified physicians and licensed medical professionals brings decades of combined
                experience in aesthetic medicine. We stay at the forefront of medical advances to provide you with the
                safest, most effective treatments available.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Dr. James Rosing</LearnMoreButton>
                <br />
                <LearnMoreButton href="/plastic-surgery">Explore Plastic Surgery Services</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

