"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";
import Head from 'next/head'



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

const approaches = [
  {
    category: "Cardiometabolic Health",
    id: "cardiometabolic-optimization",
    description: "Comprehensive approach to heart and metabolic health.",
    approaches: ["Heart Health Assessment", "Metabolic Testing", "Nutritional Guidance", "Exercise Programs", "Lifestyle Modifications"],
    image: mediaId("articles/categories/functional-medicine-cardio")
  },
  {
    category: "Epigenetic Optimization",
    id: "epigenetic-optimization",
    description: "Personalized treatments based on genetic factors.",
    approaches: ["Genetic Testing", "DNA Analysis", "Personalized Protocols", "Environmental Factors", "Lifestyle Integration"],
    image: mediaId("articles/categories/functional-medicine-epigenetic")
  },
  {
    category: "Hair Restoration",
    id: "hair-restoration",
    description: "Advanced techniques for hair regrowth and restoration.",
    approaches: ["PRP Therapy", "Stem Cell Treatment", "Scalp Micropigmentation", "Nutritional Support", "Hormone Optimization"],
    image: mediaId("articles/categories/functional-medicine-hair")
  },
  {
    category: "Hormone Optimization",
    id: "hormone-optimization",
    description: "Balancing and optimizing hormone levels for overall well-being.",
    approaches: ["Hormone Testing", "Bioidentical Hormones", "Thyroid Management", "Adrenal Support", "Sexual Health"],
    image: mediaId("articles/categories/functional-medicine-hormone")
  },
  {
    category: "Neurocognitive Health",
    id: "neurocognitive-performance",
    description: "Enhancing brain function and cognitive abilities.",
    approaches: ["Cognitive Assessment", "Brain Mapping", "Memory Enhancement", "Focus Improvement", "Stress Management"],
    image: mediaId("articles/categories/functional-medicine-neuro")
  },
  {
    category: "Sleep & Travel Health",
    id: "sleep-travel-optimization",
    description: "Improving sleep quality and managing travel-related health issues.",
    approaches: ["Sleep Analysis", "Circadian Optimization", "Jet Lag Management", "Travel Wellness", "Recovery Protocols"],
    image: mediaId("articles/categories/functional-medicine-sleep")
  }
]

export default function FunctionalMedicine() {
  return (
    <main className="min-h-screen bg-black">
      <Head>
        <title>Functional Medicine | Advanced Health Optimization | Allure MD</title>
        <meta name="description" content="Comprehensive functional medicine services for optimizing health and wellness. Specialized treatments in cardiometabolic health, hormone optimization, neurocognitive performance, and more." />
        <meta name="keywords" content="functional medicine, health optimization, hormone therapy, cardiometabolic health, epigenetic optimization, neurocognitive health, Newport Beach" />
      </Head>
      
      <Suspense fallback={null}>
        <ScrollHandler />
      </Suspense>
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        {/* Desktop Hero with full-screen image and text overlay */}
        <div className="hidden lg:block absolute inset-0">
          <CldImage 
            src="services/functional-medicine/functional-medicine-hero" 
            alt="Functional Medicine at Allure MD" 
            priority 
            fill 
            className="object-cover"
            config={{
              cloud: {
                cloudName: 'dyrzyfg3w'
              }
            }}
          />
          {/* Gradient overlay for desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/70" />
          
          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-8 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-white"
              >
                <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                  FUNCTIONAL MEDICINE
                </h1>
                <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Optimize your health and wellness
                </h2>
                <div className="space-y-4 text-lg font-cerebri font-light">
                  <p>
                    Experience a comprehensive approach to health at Allure MD's Functional Medicine practice.
                    We focus on identifying and treating root causes to optimize your overall well-being.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                    <LearnMoreButton href="/reviews">View Success Stories</LearnMoreButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Mobile Hero */}
        <div className="lg:hidden">
          {/* Media container with full width */}
          <div className="relative w-full aspect-[16/9]">
            <CldImage 
              src="services/functional-medicine/functional-medicine-hero" 
              alt="Functional Medicine at Allure MD" 
              priority 
              fill 
              className="object-cover"
              config={{
                cloud: {
                  cloudName: 'dyrzyfg3w'
                }
              }}
            />
            {/* Gradient overlay for mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/70" />
            
            {/* Text positioned at the bottom of the image */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
                FUNCTIONAL MEDICINE
              </h1>
            </div>
          </div>
          
          {/* Text content continuation for mobile */}
          <div className="px-4 py-6 bg-black">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-tight font-serif">
                Optimize your health and wellness
              </h2>
              <div className="space-y-4 text-base font-cerebri font-light">
                <p>
                  Experience a comprehensive approach to health at Allure MD's Functional Medicine practice.
                  We focus on identifying and treating root causes to optimize your overall well-being.
                </p>
                <div className="flex flex-col space-y-4 mt-6">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <LearnMoreButton href="/reviews">View Success Stories</LearnMoreButton>
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
                    <LearnMoreButton href={`/services/functional-medicine/${category.id}`}>
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
                <LearnMoreButton href="/appointment">Schedule Your Consultation</LearnMoreButton>
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