"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';
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

const treatments = [
  {
    category: "Skin Screening",
    id: "skin-screening",
    description: "Comprehensive evaluations and treatments for optimal skin health.",
    treatments: ["Full Body Examination", "Mole Mapping", "Early Detection", "Prevention Strategies", "Regular Monitoring"],
    image: mediaId("services/dermatology/dermatology-skin-health")
  },
  {
    category: "Acne",
    id: "acne",
    description: "Advanced treatments for acne and related conditions.",
    treatments: ["Topical Treatments", "Oral Medications", "Chemical Peels", "Light Therapy", "Scar Treatment"],
    image: mediaId("services/dermatology/dermatology-acne")
  },
  {
    category: "Eczema",
    id: "eczema",
    description: "Management and treatment of eczema and dermatitis.",
    treatments: ["Moisturizing Therapy", "Topical Steroids", "Immunomodulators", "Trigger Avoidance", "Lifestyle Modifications"],
    image: mediaId("services/dermatology/dermatology-eczema")
  },
  {
    category: "Rosacea",
    id: "rosacea",
    description: "Specialized care for rosacea symptoms.",
    treatments: ["Trigger Management", "Topical Treatments", "Oral Antibiotics", "Laser Therapy", "Skincare Routine"],
    image: mediaId("services/dermatology/dermatology-rosacea")
  },
  {
    category: "Psoriasis",
    id: "psoriasis",
    description: "Cutting-edge psoriasis treatments and management.",
    treatments: ["Topical Therapy", "Phototherapy", "Systemic Medications", "Biologics", "Lifestyle Support"],
    image: mediaId("services/dermatology/dermatology-psoriasis")
  }
]

export default function Dermatology() {
  return (
    <main className="min-h-screen bg-black">
      <Head>
        <title>Dermatology Services Newport Beach | Skin Care Specialists | Allure MD</title>
        <meta name="description" content="Comprehensive dermatology care at Allure MD in Newport Beach. Expert treatment for acne, eczema, psoriasis, rosacea, and preventative skin screenings." />
        <meta name="keywords" content="dermatology, skin care, acne treatment, eczema, psoriasis, rosacea, skin screening, Newport Beach, skin specialists" />
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
            src="services/dermatology/dermatology-hero" 
            alt="Dermatology at Allure MD" 
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
                  DERMATOLOGY
                </h1>
                <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Excellence in skin care
                </h2>
                <div className="space-y-4 text-lg font-cerebri font-light">
                  <p>
                    At Allure MD, our dermatology team provides comprehensive care for all your skin health needs. From medical treatments to cosmetic enhancements, we offer personalized solutions for every patient.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                    <LearnMoreButton href="/gallery/dermatology">View Before & After Gallery</LearnMoreButton>
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
              src="services/dermatology/dermatology-hero" 
              alt="Dermatology at Allure MD" 
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
                DERMATOLOGY
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
                Excellence in skin care
              </h2>
              <div className="space-y-4 text-base font-cerebri font-light">
                <p>
                  At Allure MD, our dermatology team provides comprehensive care for all your skin health needs. From medical treatments to cosmetic enhancements, we offer personalized solutions for every patient.
                </p>
                <div className="flex flex-col space-y-4 mt-6">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <LearnMoreButton href="/gallery/dermatology">View Before & After Gallery</LearnMoreButton>
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
            {treatments.map((category, index) => (
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
                    {category.treatments.map((treatment) => (
                      <li key={treatment} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href={`/services/dermatology/${category.id}`}>
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
              Your Journey to Healthy Skin
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Discover the path to radiant, healthy skin with our expert dermatology team. We&apos;re here to guide you every step of the way.
              </p>
              <div>
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