"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ScrollHandler() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      const element = document.getElementById(section)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [searchParams])

  return null
}

const procedures = [
  {
    category: "Head & Neck",
    id: "head-and-neck",
    description: "Refined procedures for facial rejuvenation and harmony.",
    procedures: ["Eyelids", "Ears", "Face", "Neck", "Nose"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133478/services-plastic-surgery/hero/plastic-surgery-face-neck-procedures.png"
  },
  {
    category: "Breast",
    id: "breast",
    description: "Customized breast enhancement and reconstruction procedures.",
    procedures: ["Augmentation", "Lift", "Reduction", "Revision", "Nipple Areolar Complex"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133479/services-plastic-surgery/hero/plastic-surgery-breast-procedures.png"
  },
  {
    category: "Body",
    id: "body",
    description: "Comprehensive body contouring and refinement procedures.",
    procedures: ["Abdominoplasty", "Mini-Abdominoplasty", "Liposuction", "Arm Lift", "Thigh Lift"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133479/services-plastic-surgery/hero/plastic-surgery-body-procedures.png"
  }
]

export default function PlasticSurgery() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={null}>
        <ScrollHandler />
      </Suspense>
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133480/services-plastic-surgery/hero/plastic-surgery-hero.png"
            alt="Plastic Surgery at Allure MD"
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
                Plastic Surgery
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Artistry in aesthetic transformation
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  At Allure MD, we combine surgical expertise with an artistic vision to enhance your natural beauty.
                  Our board-certified plastic surgeons deliver personalized care and exceptional results.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery">View Before & After Gallery</LearnMoreButton>
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
            {procedures.map((category, index) => (
              <motion.div
                id={category.id}
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-12 items-center scroll-mt-20`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.category}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {category.category}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
                    {category.description}
                  </p>
                  <ul className="space-y-4">
                    {category.procedures.map((procedure) => (
                      <li key={procedure} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{procedure}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href={`/services/plastic-surgery/${category.id}`}>
                      Learn More
                    </LearnMoreButton>
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
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards achieving your aesthetic goals. Our expert team is ready to guide you through your transformation journey.
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