"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



const treatments = [
  {
    title: "RF Microneedling Face",
    description: "Precision treatment for facial skin tightening and rejuvenation.",
    details: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture and tone",
      "Minimizes pore size",
      "Stimulates collagen production"
    ],
    image: mediaId("medical-spa/rf-microneedling-face")
  },
  {
    title: "RF Microneedling Body",
    description: "Targeted body treatments for skin tightening and texture improvement.",
    details: [
      "Reduces appearance of stretch marks",
      "Improves skin laxity",
      "Smooths uneven texture",
      "Tightens loose skin"
    ],
    image: mediaId("medical-spa/rf-microneedling-body")
  },
  {
    title: "Scar Reduction",
    description: "Specialized treatments for minimizing the appearance of scars.",
    details: [
      "Acne scar reduction",
      "Surgical scar improvement",
      "Stretch mark treatment",
      "Custom treatment protocols"
    ],
    image: mediaId("medical-spa/rf-microneedling-scars")
  },
  {
    title: "Skin Tightening",
    description: "Advanced RF technology for non-surgical skin tightening.",
    details: [
      "Neck and jawline definition",
      "Abdomen tightening",
      "Arms and thighs improvement",
      "Progressive results program"
    ],
    image: mediaId("medical-spa/rf-microneedling-tightening")
  }
]

export default function RFMicroneedlingPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <CldImage publicId="medical-spa/skin-rejuvenation-hero.jpg" alt="RF Microneedling Treatments" priority fill / config={{
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
                RF Microneedling
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced skin tightening and rejuvenation
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience the power of radiofrequency microneedling technology to stimulate collagen production, tighten skin, and address a wide range of skin concerns with minimal downtime.
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
              Experience the RF Microneedling difference
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                RF Microneedling combines two proven technologies for dramatic skin improvement with minimal downtime.
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