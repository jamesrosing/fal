"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

export function CareersSection() {
  return (
    <section className="bg-[#f5f5f5] py-24 dark:bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="mb-4 text-xl">Careers</h2>
            <h3 className="mb-8 text-4xl font-bold md:text-5xl">Join us in creating the future of defense.</h3>
            <p className="mb-8 text-lg leading-relaxed">
              From light bulb to functional prototype in a week. An engineer's playground where we make what we feel is
              right and needs to exist. A dedicated team rallying around a shared intention to make a positive impact by
              creating a safer world. That's life at Anduril.
            </p>
            <LearnMoreButton href="/careers">Learn More</LearnMoreButton>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10th%20section%20main%20page-DtfX6SUOfeKpGLjreDiD5KpkPBuYpk.png"
                alt="Engineer working"
                className="h-64 w-full rounded-lg object-cover"
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10th%20section%20main%20page-DtfX6SUOfeKpGLjreDiD5KpkPBuYpk.png"
                alt="Team collaboration"
                className="h-64 w-full rounded-lg object-cover"
              />
            </div>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10th%20section%20main%20page-DtfX6SUOfeKpGLjreDiD5KpkPBuYpk.png"
              alt="Solar panel installation"
              className="h-64 w-full rounded-lg object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

