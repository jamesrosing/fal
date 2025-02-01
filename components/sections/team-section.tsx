"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"

export function TeamSection() {
  const teamImages = [
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dr_James_Rosing_white_bg-5w4lH8VlTQFJUoq0ggd5Y9dFbESMHJ.png",
      alt: "Dr. James Rosing"
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-Jsjg50FwPodXo3xuTN7sv0WlGo63gL.webp",
      alt: "Dr. Susan Pearose"
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetican%20headshot-ogGKpiWSQrqW5Z4sv9pf1kiyuctPTJ.webp",
      alt: "Julia, Medical Esthetician"
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pooja%20gidwani%20md%20functional%20medince%20headshot-yNLxeL8rTQtSRlD1g9kR6ZZFgiZoKR.webp",
      alt: "Dr. Pooja Gidwani"
    }
  ];

  return (
    <section className="relative min-h-screen bg-black">
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
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Our Team</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Expert care from trusted professionals
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                decades of combined experience in aesthetic medicine.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
                <br />
                <LearnMoreButton href="/about">Learn About Our Practice</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Image Grid */}
        <div className="relative h-screen">
          <div className="grid grid-cols-2 gap-1 h-full mx-1">
            {teamImages.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover object-[center_15%]"
                  sizes="50vw"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex container mx-auto min-h-screen flex-row">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 flex flex-col justify-center px-4 py-24 text-white lg:w-1/2"
        >
          <motion.div className="max-w-3xl">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Our Team</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Expert care from trusted professionals
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                decades of combined experience in aesthetic medicine. We are committed to delivering exceptional results
                while ensuring your comfort and safety.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
                <br />
                <LearnMoreButton href="/about">Learn About Our Practice</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Team photos grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-2 gap-1 lg:w-1/2 lg:-mr-[8.33%]"
        >
          {teamImages.map((image, index) => (
            <div key={index} className="relative h-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover object-[center_15%]"
                sizes="25vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

