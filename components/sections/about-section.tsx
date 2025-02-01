"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

export function AboutSection() {
  return (
    <section className="relative min-h-screen bg-[#f5f5f5] dark:bg-black">
      {/* Desktop Layout */}
      <div className="hidden lg:block relative min-h-screen">
        {/* Desktop Background Image */}
        <div className="absolute inset-0 group">
          <Image
            src="https://z5qbcqdwyuqdzrkq.public.blob.vercel-storage.com/allure%20md%20team-6TUXPQwPjawHW8XhzAkP2rYJ0mtpt6.webp"
            alt="Allure MD Medical Team"
            fill
            className="object-cover object-[center_15%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-0" />
        </div>

        {/* Desktop Text Content */}
        <div className="relative container mx-auto px-4 min-h-screen flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl text-white py-24"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">About Us</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Setting new standards in aesthetic medicine
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
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
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col">
        {/* Mobile Text Content */}
        <div className="w-full px-4 py-12 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl text-white"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">About Us</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Setting new standards in aesthetic medicine
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
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
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Image */}
        <div className="relative h-[40vh] group">
          <Image
            src="https://z5qbcqdwyuqdzrkq.public.blob.vercel-storage.com/allure%20md%20team-6TUXPQwPjawHW8XhzAkP2rYJ0mtpt6.webp"
            alt="Allure MD Medical Team"
            fill
            className="object-cover object-[center_15%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-0" />
        </div>
      </div>
    </section>
  )
}

