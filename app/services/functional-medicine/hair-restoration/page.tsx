"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


const treatments = [
  {
    title: "PRP Therapy",
    description: "Advanced platelet-rich plasma treatments for hair growth.",
    details: [
      "Concentrated growth factors",
      "Natural hair stimulation",
      "Scalp rejuvenation",
      "Customized treatment plans",
      "Progressive results monitoring"
    ]
  },
  {
    title: "Stem Cell Treatment",
    description: "Innovative stem cell therapy for hair regeneration.",
    details: [
      "Advanced cell therapy",
      "Follicle regeneration",
      "Growth factor activation",
      "Tissue regeneration",
      "Long-term results"
    ]
  },
  {
    title: "Scalp Micropigmentation",
    description: "Precise cosmetic enhancement for scalp appearance.",
    details: [
      "Natural hairline simulation",
      "Density appearance",
      "Scar camouflage",
      "Custom color matching",
      "Long-lasting results"
    ]
  },
  {
    title: "Nutritional Support",
    description: "Comprehensive nutritional approach for hair health.",
    details: [
      "Vitamin assessment",
      "Mineral analysis",
      "Dietary recommendations",
      "Supplement protocols",
      "Ongoing nutritional support"
    ]
  },
  {
    title: "Hormone Optimization",
    description: "Balancing hormones for optimal hair growth.",
    details: [
      "Hormone level testing",
      "DHT management",
      "Thyroid optimization",
      "Stress hormone balance",
      "Ongoing monitoring"
    ]
  }
]

export default function HairRestorationPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="articles/categories/functional-medicine-hair.png" alt="Hair Restoration Services"   priority fill / config={{
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
                Functional Medicine Services
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Hair Restoration
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience comprehensive hair restoration solutions that combine advanced treatments
                  with functional medicine approaches for optimal results.
                </p>
                <div>
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/about#pooja-gidwani">Dr. Pooja Gidwani, Functional Medicine Specialist</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 md:gap-24">
            {treatments.map((treatment, index) => (
              <motion.div
                key={treatment.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className="text-white">
                  <h3 className="mb-4 text-2xl font-serif">{treatment.title}</h3>
                  <p className="mb-8 text-lg font-cerebri font-light">
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Restore Your Confidence
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Begin your hair restoration journey
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards fuller, healthier hair with our comprehensive
                hair restoration program.
              </p>
              <div>
                <LearnMoreButton href="/appointment">Schedule Your Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/financing">Learn About Financing</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 