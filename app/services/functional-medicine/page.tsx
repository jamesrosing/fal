"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

const approaches = [
  {
    category: "Cardiometabolic Health",
    id: "cardiometabolic-optimization",
    description: "Comprehensive approach to heart and metabolic health.",
    approaches: ["Heart Health Assessment", "Metabolic Testing", "Nutritional Guidance", "Exercise Programs", "Lifestyle Modifications"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-cardio.webp"
  },
  {
    category: "Epigenetic Optimization",
    id: "epigenetic-optimization",
    description: "Personalized treatments based on genetic factors.",
    approaches: ["Genetic Testing", "DNA Analysis", "Personalized Protocols", "Environmental Factors", "Lifestyle Integration"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-epigenetic.webp"
  },
  {
    category: "Hair Restoration",
    id: "hair-restoration",
    description: "Advanced techniques for hair regrowth and restoration.",
    approaches: ["PRP Therapy", "Stem Cell Treatment", "Scalp Micropigmentation", "Nutritional Support", "Hormone Optimization"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-hair.webp"
  },
  {
    category: "Hormone Optimization",
    id: "hormone-optimization",
    description: "Balancing and optimizing hormone levels for overall well-being.",
    approaches: ["Hormone Testing", "Bioidentical Hormones", "Thyroid Management", "Adrenal Support", "Sexual Health"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-hormone.webp"
  },
  {
    category: "Neurocognitive Health",
    id: "neurocognitive-performance",
    description: "Enhancing brain function and cognitive abilities.",
    approaches: ["Cognitive Assessment", "Brain Mapping", "Memory Enhancement", "Focus Improvement", "Stress Management"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-neuro.webp"
  },
  {
    category: "Sleep & Travel Health",
    id: "sleep-travel-optimization",
    description: "Improving sleep quality and managing travel-related health issues.",
    approaches: ["Sleep Analysis", "Circadian Optimization", "Jet Lag Management", "Travel Wellness", "Recovery Protocols"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-sleep.webp"
  }
]

export default function FunctionalMedicine() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      const element = document.getElementById(section)
      if (element) {
        // Add a slight delay to ensure smooth scrolling after page load
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/functional-medicine-hero.webp"
            alt="Functional Medicine at Allure MD"
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
                Functional Medicine
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Optimize your health and wellness
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience a comprehensive approach to health at Allure MD&apos;s Functional Medicine practice.
                  We focus on identifying and treating root causes to optimize your overall well-being.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery">View Success Stories</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approaches Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-24">
            {approaches.map((category, index) => (
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
                    {category.approaches.map((approach) => (
                      <li key={approach} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{approach}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href={`/functional-medicine/${category.category.toLowerCase()}`}>
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
              Your Path to Optimal Health
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Begin your wellness journey today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Take the first step towards optimizing your health with our comprehensive functional medicine approach.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
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