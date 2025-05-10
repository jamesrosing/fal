"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



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
    image: mediaId("services-dermatology/hero/dermatology-skin-health")
  },
  {
    category: "Acne",
    id: "acne",
    description: "Advanced treatments for acne and related conditions.",
    treatments: ["Topical Treatments", "Oral Medications", "Chemical Peels", "Light Therapy", "Scar Treatment"],
    image: mediaId("services-dermatology/hero/dermatology-acne")
  },
  {
    category: "Eczema",
    id: "eczema",
    description: "Management and treatment of eczema and dermatitis.",
    treatments: ["Moisturizing Therapy", "Topical Steroids", "Immunomodulators", "Trigger Avoidance", "Lifestyle Modifications"],
    image: mediaId("services-dermatology/hero/dermatology-eczema")
  },
  {
    category: "Rosacea",
    id: "rosacea",
    description: "Specialized care for rosacea symptoms.",
    treatments: ["Trigger Management", "Topical Treatments", "Oral Antibiotics", "Laser Therapy", "Skincare Routine"],
    image: mediaId("services-dermatology/hero/dermatology-rosacea")
  },
  {
    category: "Psoriasis",
    id: "psoriasis",
    description: "Cutting-edge psoriasis treatments and management.",
    treatments: ["Topical Therapy", "Phototherapy", "Systemic Medications", "Biologics", "Lifestyle Support"],
    image: mediaId("services-dermatology/hero/dermatology-psoriasis")
  }
]

export default function Dermatology() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={null}>
        <ScrollHandler />
      </Suspense>
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <CldImage publicId="services-dermatology/hero/dermatology-hero.png" alt="Dermatology at Allure MD"   priority fill />
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
                Dermatology
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Excellence in skin care
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  At Allure MD, our dermatology team provides comprehensive care for all your skin health needs.
                  From medical treatments to cosmetic enhancements, we offer personalized solutions for every patient.
                </p>
                <div>
                  <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/about#susan-pearose">Susan Pearose, Certified Dermatology Specialist</LearnMoreButton>
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