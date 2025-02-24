"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const treatments = [
  {
    title: "Cognitive Assessment",
    description: "Comprehensive evaluation of brain function and performance.",
    details: [
      "Memory testing",
      "Attention assessment",
      "Processing speed",
      "Executive function",
      "Cognitive flexibility"
    ]
  },
  {
    title: "Brain Mapping",
    description: "Advanced neurological assessment and optimization.",
    details: [
      "EEG analysis",
      "Neural connectivity",
      "Brain wave patterns",
      "Cognitive networks",
      "Performance metrics"
    ]
  },
  {
    title: "Memory Enhancement",
    description: "Targeted protocols for memory optimization.",
    details: [
      "Working memory",
      "Long-term recall",
      "Information processing",
      "Neural plasticity",
      "Memory techniques"
    ]
  },
  {
    title: "Focus Improvement",
    description: "Strategies and treatments for enhanced concentration.",
    details: [
      "Attention training",
      "Distraction management",
      "Mental clarity",
      "Task switching",
      "Sustained focus"
    ]
  },
  {
    title: "Stress Management",
    description: "Comprehensive approach to cognitive stress reduction.",
    details: [
      "Stress response",
      "Cognitive resilience",
      "Emotional regulation",
      "Mindfulness practices",
      "Relaxation techniques"
    ]
  }
]

export default function NeurocognitivePage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-neuro.webp"
            alt="Neurocognitive Performance Services"
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
                Functional Medicine Services
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Neurocognitive Performance
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Enhance your cognitive abilities and mental performance through our
                  comprehensive neurocognitive optimization program.
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
              Optimize Your Brain
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Unlock your cognitive potential
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards enhanced mental performance and cognitive clarity
                with our advanced neurocognitive program.
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