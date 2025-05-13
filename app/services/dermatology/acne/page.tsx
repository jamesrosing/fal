"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


const treatments = [
  {
    title: "Topical Treatments",
    description: "Advanced topical solutions for acne management.",
    details: [
      "Prescription-strength medications",
      "Medical-grade skincare products",
      "Targeted spot treatments",
      "Anti-inflammatory solutions",
      "Preventive care products"
    ]
  },
  {
    title: "Oral Medications",
    description: "Comprehensive internal treatment approaches.",
    details: [
      "Prescription antibiotics",
      "Hormone regulation therapy",
      "Isotretinoin treatment",
      "Anti-androgen medications",
      "Systemic inflammation control"
    ]
  },
  {
    title: "Chemical Peels",
    description: "Professional exfoliation treatments for clearer skin.",
    details: [
      "Customized peel formulations",
      "Deep pore cleansing",
      "Dead skin cell removal",
      "Texture improvement",
      "Acne scar treatment"
    ]
  },
  {
    title: "Light Therapy",
    description: "Advanced light-based treatments for acne control.",
    details: [
      "Blue light therapy",
      "Red light therapy",
      "Photodynamic therapy",
      "LED treatment sessions",
      "Combination light protocols"
    ]
  },
  {
    title: "Scar Treatment",
    description: "Specialized treatments for acne scarring.",
    details: [
      "Laser resurfacing",
      "Microneedling therapy",
      "Dermal fillers for scars",
      "Chemical treatments",
      "Texture improvement protocols"
    ]
  }
]

export default function AcnePage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage 
            src="services/dermatology/dermatology-acne" 
            alt="Acne Treatment Services" 
            priority 
            fill 
            config={{
              cloud: {
                cloudName: 'dyrzyfg3w', // Use your Cloudinary cloud name
              }
            }}
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
                Dermatology Services
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced Acne Treatment
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our comprehensive acne treatment program combines the latest medical advances with
                  personalized care to help you achieve clear, healthy skin.
                </p>
                <p>We&apos;re here to help you achieve clear, healthy skin.</p>
                <p>Our dermatology team specializes in treating acne and related conditions.</p>
                <div>
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/about#susan-pearose">Susan Pearose, Certified Dermatology Specialist</LearnMoreButton>
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
              Start Your Journey to Clear Skin
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your acne treatment today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Don't let acne affect your confidence. Our expert team is here to help you
                achieve the clear, healthy skin you deserve.
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