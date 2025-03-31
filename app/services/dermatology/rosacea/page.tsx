"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const treatments = [
  {
    title: "Medical Treatment",
    description: "Advanced medical solutions for rosacea management.",
    details: [
      "Prescription medications",
      "Topical anti-inflammatory agents",
      "Oral antibiotics",
      "Blood vessel treatments",
      "Specialized skincare products"
    ]
  },
  {
    title: "Laser Therapy",
    description: "State-of-the-art laser treatments for visible blood vessels.",
    details: [
      "Vascular laser treatment",
      "IPL therapy",
      "Redness reduction",
      "Texture improvement",
      "Long-term management"
    ]
  },
  {
    title: "Trigger Management",
    description: "Comprehensive approach to identifying and avoiding triggers.",
    details: [
      "Trigger identification",
      "Environmental protection",
      "Diet modifications",
      "Lifestyle adjustments",
      "Stress management"
    ]
  },
  {
    title: "Skincare Protocol",
    description: "Customized skincare routines for rosacea-prone skin.",
    details: [
      "Gentle cleansing methods",
      "Barrier protection",
      "Anti-inflammatory products",
      "Sun protection",
      "Calming treatments"
    ]
  },
  {
    title: "Maintenance Care",
    description: "Long-term strategies for rosacea control.",
    details: [
      "Regular monitoring",
      "Preventive care",
      "Flare-up management",
      "Ongoing support",
      "Treatment adjustments"
    ]
  }
]

export default function RosaceaPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <OptimizedImage id="services-dermatology/hero/dermatology-rosacea.png" alt="Rosacea Treatment Services"   priority fill />
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
              Advanced Rosacea Treatment
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our comprehensive rosacea treatment program combines advanced medical therapies
                with personalized care to help you achieve clearer, calmer skin.
              </p>
              <p>We&apos;re here to help you manage your rosacea effectively.</p>
              <p>Our dermatology team specializes in treating rosacea and related conditions.</p>
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
              Take Control of Your Rosacea
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Begin your journey to clearer skin today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Don't let rosacea affect your confidence. Our expert team is here to help you
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