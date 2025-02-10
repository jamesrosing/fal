"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const procedures = [
  {
    title: "Breast Augmentation",
    description: "Enhance breast size and shape with implants or fat transfer.",
    details: [
      "Silicone gel implants for natural look and feel",
      "Saline implants with customizable size",
      "Fat transfer for natural enhancement",
      "Various implant placement options"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-augmentation.jpg"
  },
  {
    title: "Breast Lift (Mastopexy)",
    description: "Restore a more youthful breast position and shape.",
    details: [
      "Traditional breast lift for significant sagging",
      "Mini lift for mild to moderate sagging",
      "Combined lift with augmentation",
      "Scarless lift techniques for minimal sagging"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-lift.jpg"
  },
  {
    title: "Breast Reduction",
    description: "Achieve more proportionate breasts and relieve discomfort.",
    details: [
      "Traditional reduction for significant size decrease",
      "Liposuction-assisted reduction",
      "Vertical scar technique",
      "Male breast reduction (Gynecomastia)"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-reduction.jpg"
  },
  {
    title: "Breast Revision",
    description: "Correct or improve previous breast surgery results.",
    details: [
      "Implant replacement or removal",
      "Capsular contracture correction",
      "Implant position adjustment",
      "Asymmetry correction"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-revision.jpg"
  },
  {
    title: "Nipple & Areola Procedures",
    description: "Enhance or correct nipple and areola appearance.",
    details: [
      "Nipple reduction or enhancement",
      "Areola reduction",
      "Inverted nipple correction",
      "Nipple reconstruction"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/nipple-areola.jpg"
  }
]

export default function BreastPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-hero.jpg"
            alt="Breast Procedures"
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
                Breast Procedures
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Customized breast enhancement and reconstruction
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our comprehensive breast procedures are designed to help you achieve your desired shape and size while maintaining a natural appearance. Each procedure is tailored to your unique anatomy and aesthetic goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/breast">View Before & After Gallery</LearnMoreButton>
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