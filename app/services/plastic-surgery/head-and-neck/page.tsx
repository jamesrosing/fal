"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const procedures = [
  {
    title: "Eyelids (Blepharoplasty)",
    description: "Rejuvenate tired-looking eyes and restore a more youthful appearance.",
    details: [
      "Upper eyelid surgery to remove excess skin and reduce puffiness",
      "Lower eyelid surgery to address bags and wrinkles",
      "Combined upper and lower blepharoplasty",
      "Asian eyelid surgery for creating or refining the upper eyelid crease"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/eyelids.jpg"
  },
  {
    title: "Ears (Otoplasty)",
    description: "Reshape and reposition the ears for improved facial harmony.",
    details: [
      "Ear pinning for prominent ears",
      "Ear reduction surgery",
      "Earlobe repair and reshaping",
      "Correction of congenital ear deformities"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/ears.jpg"
  },
  {
    title: "Face (Rhytidectomy)",
    description: "Comprehensive facial rejuvenation to address signs of aging.",
    details: [
      "Traditional facelift for comprehensive rejuvenation",
      "Mini facelift for early signs of aging",
      "Mid-face lift to address cheek sagging",
      "Thread lift for minimally invasive facial rejuvenation"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/face.jpg"
  },
  {
    title: "Neck (Cervicoplasty)",
    description: "Restore a more defined and youthful neck contour.",
    details: [
      "Neck lift to remove excess skin and fat",
      "Platysmal band treatment",
      "Submental liposuction for double chin",
      "Non-surgical neck rejuvenation options"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/neck.jpg"
  },
  {
    title: "Nose (Rhinoplasty)",
    description: "Enhance nasal aesthetics and improve breathing function.",
    details: [
      "Primary rhinoplasty for aesthetic enhancement",
      "Revision rhinoplasty for previous surgery correction",
      "Septoplasty for breathing improvement",
      "Non-surgical rhinoplasty using dermal fillers"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/nose.jpg"
  }
]

export default function HeadAndNeckPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/head-and-neck-hero.jpg"
            alt="Head and Neck Procedures"
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
                Head & Neck Procedures
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Refined procedures for facial rejuvenation and harmony
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our comprehensive suite of head and neck procedures is designed to enhance your natural beauty and restore a more youthful appearance. Each procedure is tailored to your unique features and aesthetic goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/head-and-neck">View Before & After Gallery</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-24">
            {procedures.map((procedure, index) => (
              <motion.div
                key={procedure.title}
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
                      src={procedure.image}
                      alt={procedure.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {procedure.title}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
                    {procedure.description}
                  </p>
                  <ul className="space-y-4">
                    {procedure.details.map((detail) => (
                      <li key={detail} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
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
              Your Journey Begins Here
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Transform with confidence
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards achieving your aesthetic goals with our expert team of board-certified plastic surgeons.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
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