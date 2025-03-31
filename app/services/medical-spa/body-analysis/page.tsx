"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const services = [
  {
    title: "3D Body Scanning",
    description: "Advanced imaging technology for precise body measurements and analysis.",
    details: [
      "Full-body composition analysis",
      "Precise measurements and tracking",
      "Progress monitoring over time",
      "Customized treatment planning"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/3d-body-scanning.jpg"
  },
  {
    title: "Body Composition Analysis",
    description: "Detailed analysis of body fat, muscle mass, and metabolic health.",
    details: [
      "Body fat percentage measurement",
      "Muscle mass analysis",
      "Metabolic rate assessment",
      "Hydration level monitoring"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/body-composition.jpg"
  },
  {
    title: "Treatment Planning",
    description: "Personalized treatment recommendations based on analysis results.",
    details: [
      "Customized treatment protocols",
      "Progress tracking",
      "Goal setting and monitoring",
      "Regular assessment updates"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/treatment-planning.jpg"
  }
]

export default function BodyAnalysisPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <OptimizedImage id="medical-spa/body-analysis-hero.jpg" alt="Body Analysis Services"   priority fill />
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
                Body Analysis
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced body composition analysis and tracking
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our state-of-the-art body analysis services provide detailed insights into your body composition, helping us create personalized treatment plans for optimal results.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-24">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
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
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {service.title}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
                    {service.description}
                  </p>
                  <ul className="space-y-4">
                    {service.details.map((detail) => (
                      <li key={detail} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href="/appointment">Schedule an Analysis</LearnMoreButton>
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
              Start Your Journey
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Understand your body better
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Begin your transformation journey with a comprehensive body analysis that will guide your personalized treatment plan.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Analysis</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 