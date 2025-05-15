"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


const treatments = [
  {
    title: "Sleep Analysis",
    description: "Comprehensive sleep pattern assessment and optimization.",
    details: [
      "Sleep study analysis",
      "Circadian rhythm assessment",
      "Sleep quality metrics",
      "Environmental factors",
      "Sleep hygiene evaluation"
    ]
  },
  {
    title: "Circadian Optimization",
    description: "Advanced techniques for natural rhythm restoration.",
    details: [
      "Light exposure therapy",
      "Melatonin regulation",
      "Meal timing strategies",
      "Activity scheduling",
      "Temperature regulation"
    ]
  },
  {
    title: "Jet Lag Management",
    description: "Specialized protocols for travel-related sleep disruption.",
    details: [
      "Time zone adaptation",
      "Pre-travel preparation",
      "In-flight strategies",
      "Post-arrival recovery",
      "Supplement protocols"
    ]
  },
  {
    title: "Travel Wellness",
    description: "Comprehensive health support for frequent travelers.",
    details: [
      "Immune system support",
      "Hydration strategies",
      "Nutrition planning",
      "Stress management",
      "Exercise adaptation"
    ]
  },
  {
    title: "Recovery Protocols",
    description: "Personalized recovery and adaptation strategies.",
    details: [
      "Sleep restoration",
      "Energy optimization",
      "Physical recovery",
      "Mental adaptation",
      "Performance maintenance"
    ]
  }
]

export default function SleepTravelPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="articles/categories/functional-medicine-sleep.png" alt="Sleep & Travel Optimization Services"   priority fill / config={{
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
                Sleep & Travel Optimization
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Optimize your sleep quality and maintain peak performance during travel with our
                  comprehensive sleep and travel wellness program.
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
              Optimize Your Rest & Travel
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Begin your journey to better sleep and travel wellness
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards optimized sleep and enhanced travel performance
                with our specialized program.
              </p>
              <div>
                <LearnMoreButton href="/appointment">Schedule Your Assessment</LearnMoreButton>
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