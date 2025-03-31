"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const procedures = [
  {
    title: "Tummy Tuck (Abdominoplasty)",
    description: "Achieve a flatter, more toned abdominal profile.",
    details: [
      "Full tummy tuck for comprehensive results",
      "Mini tummy tuck for lower abdomen",
      "Extended tummy tuck for post-weight loss",
      "Muscle repair and skin tightening"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/tummy-tuck.jpg"
  },
  {
    title: "Liposuction",
    description: "Sculpt and contour various areas of the body.",
    details: [
      "Traditional tumescent liposuction",
      "Power-assisted liposuction (PAL)",
      "360° liposuction",
      "High-definition liposculpting"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/liposuction.jpg"
  },
  {
    title: "Body Lift",
    description: "Comprehensive body contouring after weight loss.",
    details: [
      "Lower body lift",
      "Upper body lift",
      "Total body lift",
      "Thigh lift procedures"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/body-lift.jpg"
  },
  {
    title: "Brazilian Butt Lift",
    description: "Natural enhancement using your own fat tissue.",
    details: [
      "Fat transfer to buttocks",
      "Liposuction of donor areas",
      "Custom shape and projection",
      "Long-lasting results"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/bbl.jpg"
  },
  {
    title: "Arm Lift (Brachioplasty)",
    description: "Reshape and tighten the upper arms.",
    details: [
      "Traditional arm lift",
      "Mini arm lift",
      "Extended arm lift",
      "Liposuction-assisted techniques"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/arm-lift.jpg"
  }
]

export default function BodyPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <OptimizedImage id="plastic-surgery/body-hero.jpg" alt="Body Procedures"   priority fill />
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
                Body Procedures
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced body contouring and sculpting
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our comprehensive body procedures are designed to help you achieve your ideal silhouette. From post-weight loss contouring to targeted fat reduction, we offer customized solutions for your unique goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/body">View Before & After Gallery</LearnMoreButton>
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