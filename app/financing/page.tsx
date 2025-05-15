"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { Card } from "@/components/ui/card"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



const financingOptions = [
  {
    name: "CareCredit®",
    description: "Healthcare financing credit card with special promotional periods",
    features: [
      "0% APR financing options",
      "Extended payment plans up to 60 months",
      "Quick credit decisions",
      "Use for all procedures"
    ],
    logo: mediaId("financing/carecredit-logo")
  },
  {
    name: "Alphaeon Credit",
    description: "Specialized credit card for cosmetic procedures",
    features: [
      "Competitive interest rates",
      "Flexible payment options",
      "Monthly payment plans",
      "Exclusive for aesthetic procedures"
    ],
    logo: mediaId("financing/alphaeon-logo")
  },
  {
    name: "PatientFi",
    description: "Modern healthcare financing platform",
    features: [
      "Simple application process",
      "Fixed monthly payments",
      "Transparent terms",
      "No hidden fees"
    ],
    logo: mediaId("financing/patientfi-logo")
  }
]

const paymentMethods = [
  {
    category: "Credit Cards",
    methods: ["Visa", "Mastercard", "American Express", "Discover"]
  },
  {
    category: "Digital Payments",
    methods: ["Apple Pay", "Google Pay", "PayPal"]
  },
  {
    category: "Other Options",
    methods: ["Cash", "Personal Check", "Wire Transfer", "HSA/FSA Cards"]
  }
]

export default function FinancingPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="financing/hero.jpg" alt="Financing Options"   priority fill / config={{
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
                Financing Options
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Making your transformation accessible
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>We&apos;re committed to making our services accessible to everyone.</p>
                <p>We offer flexible financing options to help you achieve your goals.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Financing Options Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Financing Partners
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Flexible payment solutions
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {financingOptions.map((option) => (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-zinc-900 rounded-lg p-6"
              >
                <div className="h-16 mb-6 relative">
                  <Image
                    src={option.logo}
                    alt={option.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-xl font-serif text-white mb-2">{option.name}</h4>
                <p className="text-gray-400 font-cerebri font-light mb-6">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature) => (
                    <li key={feature} className="text-gray-400 font-cerebri font-light flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Payment Methods
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Convenient payment options
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paymentMethods.map((category) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-black rounded-lg p-6"
              >
                <h4 className="text-xl font-serif text-white mb-4">{category.category}</h4>
                <ul className="space-y-2">
                  {category.methods.map((method) => (
                    <li key={method} className="text-gray-400 font-cerebri font-light flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                      {method}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Ready to Begin?
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Let's discuss your options
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Our patient care coordinators are here to help you understand your financing options and create a payment plan that works for you.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 