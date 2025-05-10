"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


const treatments = [
  {
    title: "Systemic Treatment",
    description: "Advanced medical therapies for psoriasis management.",
    details: [
      "Oral medications",
      "Biologic treatments",
      "Immunosuppressive therapy",
      "Injectable medications",
      "Combination approaches"
    ]
  },
  {
    title: "Light Therapy",
    description: "State-of-the-art phototherapy treatments.",
    details: [
      "Narrowband UVB therapy",
      "PUVA treatment",
      "Targeted phototherapy",
      "Excimer laser",
      "Combination protocols"
    ]
  },
  {
    title: "Topical Therapy",
    description: "Specialized topical treatments for symptom management.",
    details: [
      "Prescription medications",
      "Steroid treatments",
      "Vitamin D derivatives",
      "Moisturizing therapies",
      "Scale removal products"
    ]
  },
  {
    title: "Lifestyle Management",
    description: "Comprehensive approach to trigger control.",
    details: [
      "Stress reduction",
      "Diet optimization",
      "Environmental control",
      "Exercise programs",
      "Trigger avoidance"
    ]
  },
  {
    title: "Long-term Care",
    description: "Ongoing management for lasting relief.",
    details: [
      "Regular monitoring",
      "Treatment adjustments",
      "Flare prevention",
      "Maintenance therapy",
      "Quality of life support"
    ]
  }
]

export default function PsoriasisPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <OptimizedImage id="services-dermatology/hero/dermatology-psoriasis.png" alt="Psoriasis Treatment Services"   priority fill />
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
              Advanced Psoriasis Treatment
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our comprehensive psoriasis treatment program combines cutting-edge therapies
                with personalized care to help you achieve clearer, healthier skin.
              </p>
              <p>We&apos;re here to help you manage your psoriasis effectively.</p>
              <p>Our dermatology team specializes in treating psoriasis and related conditions.</p>
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
              Take Control of Your Psoriasis
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Start your journey to clearer skin today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Don't let psoriasis hold you back. Our expert team is here to help you
                achieve lasting relief and improved quality of life.
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