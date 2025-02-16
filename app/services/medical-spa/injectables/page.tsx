"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const treatments = [
  {
    title: "Neuromodulators",
    description: "Premium wrinkle-reducing injectables for natural-looking results.",
    details: [
      "BOTOX® Cosmetic treatments",
      "Dysport® injections",
      "Jeuveau® treatments",
      "Custom treatment plans"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/neuromodulators.jpg"
  },
  {
    title: "Dermal Fillers",
    description: "Advanced volume restoration and facial contouring.",
    details: [
      "Juvéderm® collection of fillers",
      "Restylane® family products",
      "RHA® collection",
      "Sculptra® Aesthetic"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/dermal-fillers.jpg"
  },
  {
    title: "Lip Enhancement",
    description: "Artful lip augmentation and definition.",
    details: [
      "Natural lip enhancement",
      "Lip border definition",
      "Volume restoration",
      "Cupid's bow refinement"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/lip-enhancement.jpg"
  },
  {
    title: "Liquid Facelift",
    description: "Non-surgical facial rejuvenation and contouring.",
    details: [
      "Full-face assessment",
      "Custom combination treatments",
      "Progressive enhancement",
      "Natural-looking results"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/liquid-facelift.jpg"
  }
]

export default function InjectablesPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/injectables-hero.jpg"
            alt="Injectable Treatments"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Injectable Treatments
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced aesthetic enhancement through precision
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience the art of injectable treatments with our expert providers. We offer a comprehensive range of premium injectables for natural-looking facial enhancement.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-24">
            {treatments.map((treatment, index) => (
              <motion.div
                key={treatment.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-12 items-center`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image
                      src={treatment.image}
                      alt={treatment.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {treatment.title}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
                    {treatment.description}
                  </p>
                  <ul className="space-y-4">
                    {treatment.details.map((detail) => (
                      <li key={detail} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href="/appointment">Schedule a Treatment</LearnMoreButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#f5f5f5] dark:bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Enhance Your Natural Beauty
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Discover your ideal treatment
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Let our expert injectors help you achieve your aesthetic goals with our premium injectable treatments.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Appointment</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 