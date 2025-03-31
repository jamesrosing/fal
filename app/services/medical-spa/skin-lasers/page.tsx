"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const treatments = [
  {
    title: "Laser Hair Removal",
    description: "Advanced laser technology for permanent hair reduction.",
    details: [
      "All skin types treated",
      "Large and small areas",
      "Year-round treatments",
      "Customized protocols"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/laser-hair-removal.jpg"
  },
  {
    title: "Laser Skin Resurfacing",
    description: "Transform skin texture and tone with precision.",
    details: [
      "Fractional laser treatments",
      "Fine lines and wrinkles",
      "Acne scar treatment",
      "Skin rejuvenation"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/laser-resurfacing.jpg"
  },
  {
    title: "IPL Photofacial",
    description: "Target pigmentation and vascular concerns.",
    details: [
      "Sun damage treatment",
      "Rosacea management",
      "Age spot removal",
      "Skin tone evening"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/ipl-photofacial.jpg"
  },
  {
    title: "Laser Vein Treatment",
    description: "Effective removal of unwanted vessels.",
    details: [
      "Spider vein treatment",
      "Facial vessel removal",
      "Leg vein therapy",
      "Multiple treatment options"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/laser-vein.jpg"
  }
]

export default function SkinLasersPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <OptimizedImage id="medical-spa/laser-treatments-hero.jpg" alt="Skin Laser Treatments" priority fill />
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
                Skin Lasers
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced skin laser technology for optimal results
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience the latest in skin laser technology with our comprehensive range of treatments designed to address various skin concerns with precision and effectiveness.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
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
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-12 items-center`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image
                      src={treatment.image}
                      alt={treatment.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {treatment.title}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
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
                  <div className="mt-8">
                    <LearnMoreButton href="/appointment">Schedule a Treatment</LearnMoreButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#f5f5f5] dark:bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Transform Your Skin
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Experience advanced skin laser treatments
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Let our expert team help you achieve your aesthetic goals with our state-of-the-art skin laser treatments.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 