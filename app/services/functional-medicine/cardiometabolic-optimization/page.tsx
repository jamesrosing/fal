"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


const treatments = [
  {
    title: "Heart Health Assessment",
    description: "Comprehensive cardiovascular evaluation and risk assessment.",
    details: [
      "Advanced lipid testing",
      "Cardiovascular biomarkers",
      "Heart rate variability analysis",
      "Blood pressure optimization",
      "Arterial health assessment"
    ]
  },
  {
    title: "Metabolic Testing",
    description: "In-depth analysis of metabolic function and efficiency.",
    details: [
      "Metabolic rate assessment",
      "Glucose regulation testing",
      "Insulin sensitivity analysis",
      "Mitochondrial function evaluation",
      "Body composition analysis"
    ]
  },
  {
    title: "Nutritional Guidance",
    description: "Personalized nutrition plans for metabolic health.",
    details: [
      "Metabolic typing assessment",
      "Nutrient deficiency testing",
      "Anti-inflammatory diet planning",
      "Supplement recommendations",
      "Meal timing strategies"
    ]
  },
  {
    title: "Exercise Programs",
    description: "Tailored physical activity recommendations for heart health.",
    details: [
      "Cardiovascular fitness assessment",
      "Exercise prescription",
      "Heart rate zone training",
      "Strength training guidance",
      "Recovery protocols"
    ]
  },
  {
    title: "Lifestyle Modifications",
    description: "Comprehensive lifestyle interventions for optimal health.",
    details: [
      "Stress management techniques",
      "Sleep optimization",
      "Work-life balance strategies",
      "Environmental factor assessment",
      "Habit formation coaching"
    ]
  }
]

export default function CardiometabolicPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="articles/categories/functional-medicine-cardio.png" alt="Cardiometabolic Health Services"   priority fill / config={{
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
                Cardiometabolic Optimization
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our comprehensive cardiometabolic program combines advanced diagnostics with
                  personalized interventions to optimize your heart and metabolic health.
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
              Start Your Journey to Optimal Health
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Transform your cardiometabolic health today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards optimizing your heart and metabolic health with our
                comprehensive functional medicine approach.
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