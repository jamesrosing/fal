"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const treatments = [
  {
    title: "Signature Facial",
    description: "Customized facial treatment for your unique skin needs.",
    details: [
      "Skin analysis and consultation",
      "Deep cleansing and exfoliation",
      "Custom mask application",
      "Relaxing facial massage"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/signature-facial.jpg"
  },
  {
    title: "HydraFacial",
    description: "Advanced hydradermabrasion for instant results.",
    details: [
      "3-step patented technology",
      "Deep pore cleansing",
      "Hydration infusion",
      "Custom boosters available"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/hydrafacial.jpg"
  },
  {
    title: "Microneedling",
    description: "Collagen induction therapy for skin regeneration.",
    details: [
      "Advanced skin needling",
      "PRP enhancement option",
      "Scar reduction",
      "Texture improvement"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/microneedling.jpg"
  },
  {
    title: "Oxygen Facial",
    description: "Rejuvenating treatment with pure oxygen infusion.",
    details: [
      "Pressurized oxygen delivery",
      "Serum infusion",
      "Instant brightening",
      "Red carpet ready results"
    ],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/oxygen-facial.jpg"
  }
]

export default function FacialTreatmentsPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/medical-spa/facial-treatments-hero.jpg"
            alt="Facial Treatments"
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
                Facial Treatments
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced facial therapies for radiant skin
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience our luxurious facial treatments designed to rejuvenate, refresh, and restore your skin's natural radiance using advanced techniques and premium products.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Treatment</LearnMoreButton>
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
                    <LearnMoreButton href="/appointment">Book This Treatment</LearnMoreButton>
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
              Experience the Difference
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Discover your perfect facial treatment
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Let our skilled aestheticians customize a facial treatment plan to help you achieve your skincare goals.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Treatment</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 