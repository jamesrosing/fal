"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const treatments = [
  {
    title: "Full Body Examination",
    description: "Comprehensive skin assessment for early detection and prevention.",
    details: [
      "Complete skin surface examination",
      "Digital documentation of findings",
      "Risk assessment and education",
      "Personalized screening schedule",
      "Prevention recommendations"
    ]
  },
  {
    title: "Mole Mapping",
    description: "Advanced digital tracking of moles and skin changes.",
    details: [
      "High-resolution photography",
      "Digital mole mapping",
      "Change detection analysis",
      "Regular monitoring updates",
      "Early warning system"
    ]
  },
  {
    title: "Early Detection",
    description: "Professional screening for skin cancer and other concerns.",
    details: [
      "Expert visual examination",
      "Dermoscopy assessment",
      "Immediate biopsy if needed",
      "Rapid pathology results",
      "Treatment planning"
    ]
  },
  {
    title: "Prevention Strategies",
    description: "Personalized plans for maintaining optimal skin health.",
    details: [
      "Sun protection guidance",
      "Skin cancer prevention education",
      "Lifestyle recommendations",
      "Skincare routine development",
      "Regular monitoring schedule"
    ]
  },
  {
    title: "Regular Monitoring",
    description: "Ongoing surveillance for optimal skin health maintenance.",
    details: [
      "Scheduled follow-up visits",
      "Progress documentation",
      "Change tracking",
      "Risk assessment updates",
      "Prevention plan adjustments"
    ]
  }
]

export default function SkinScreeningPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dermatology-skin-health.webp"
            alt="Skin Screening Services"
            fill
            className="object-cover"
            priority
          />
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
              Comprehensive Skin Screening
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our expert dermatology team provides thorough skin screenings using advanced technology
                to detect and prevent skin concerns early, ensuring your long-term skin health.
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
              Protect Your Skin Health
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your skin screening today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Early detection is key to maintaining healthy skin. Let our expert team provide you
                with comprehensive screening and personalized care.
              </p>
              <div>
                <LearnMoreButton href="/appointment">Schedule Your Screening</LearnMoreButton>
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