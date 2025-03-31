"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const treatments = [
  {
    title: "Medical Management",
    description: "Comprehensive medical approaches for eczema control.",
    details: [
      "Prescription topical medications",
      "Oral anti-inflammatory drugs",
      "Immunosuppressive treatments",
      "Phototherapy options",
      "Systemic medications"
    ]
  },
  {
    title: "Trigger Management",
    description: "Identification and control of eczema triggers.",
    details: [
      "Environmental factor analysis",
      "Allergen identification",
      "Lifestyle modification plans",
      "Stress management techniques",
      "Prevention strategies"
    ]
  },
  {
    title: "Skincare Routine",
    description: "Specialized skincare protocols for eczema-prone skin.",
    details: [
      "Gentle cleansing methods",
      "Medical-grade moisturizers",
      "Barrier repair products",
      "Anti-itch solutions",
      "Maintenance protocols"
    ]
  },
  {
    title: "Flare Management",
    description: "Rapid response protocols for eczema flares.",
    details: [
      "Emergency treatment plans",
      "Quick relief methods",
      "Inflammation control",
      "Comfort measures",
      "Recovery support"
    ]
  },
  {
    title: "Long-term Care",
    description: "Comprehensive strategies for lasting eczema control.",
    details: [
      "Maintenance therapy",
      "Regular monitoring",
      "Preventive care",
      "Lifestyle adjustments",
      "Ongoing support"
    ]
  }
]

export default function EczemaPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <OptimizedImage id="services-dermatology/hero/dermatology-eczema.png" alt="Eczema Treatment Services"   priority fill />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Hero Text Content */}
        <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Dermatology Services
            </h1>
            <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              Advanced Eczema Treatment
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                We&apos;re here to help you manage your eczema effectively.
              </p>
              <p>
                Our dermatology team specializes in treating eczema and related conditions.
              </p>
              <div>
                <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                <br />
                <LearnMoreButton href="/about#susan-pearose">Susan Pearose, Certified Dermatology Specialist</LearnMoreButton>
              </div>
            </div>
          </motion.div>
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
              Find Relief from Eczema
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Start your journey to clearer skin today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Don't let eczema control your life. Our expert team is here to help you
                achieve lasting relief and healthier skin.
              </p>
              <div>
                <LearnMoreButton href="/appointment">Schedule Your Treatment</LearnMoreButton>
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