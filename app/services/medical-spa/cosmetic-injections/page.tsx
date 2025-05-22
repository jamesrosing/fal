"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



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
    image: mediaId("medical-spa/neuromodulators")
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
    image: mediaId("medical-spa/dermal-fillers")
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
    image: mediaId("medical-spa/lip-enhancement")
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
    image: mediaId("medical-spa/liquid-facelift")
  }
]

export default function CosmeticInjectionsPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="medical-spa/injectables-hero.jpg" alt="Cosmetic Injection Treatments" priority fill / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
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
                Cosmetic Injections
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced aesthetic enhancement through precision
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience the art of cosmetic injections with our expert providers. We offer a comprehensive range of premium injectables for natural-looking facial enhancement.
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
              Discover your ideal cosmetic treatment
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Let our expert injectors help you achieve your aesthetic goals with our premium cosmetic injection treatments.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 