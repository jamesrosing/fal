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
    category: "EMSCULPT NEWPORT BEACH",
    id: "emsculpt",
    description: "Advanced non-invasive body sculpting treatments.",
    treatments: ["Muscle Building", "Fat Reduction", "Core Strengthening", "Buttocks Toning", "Arms & Calves"],
    image: mediaId("services-medical-spa/hero/medical-spa-emsculpt"),
    externalLink: "https://emsculpt-newportbeach.com"
  },
  {
    category: "ShapeScale",
    id: "shapescale",
    description: "Precise 3D body scanning and progress tracking.",
    treatments: ["3D Body Scanning", "Progress Tracking", "Body Composition", "Measurements", "Visual Progress"],
    image: mediaId("services-medical-spa/hero/medical-spa-shapescale"),
    path: "/services/medical-spa/shapescale"
  },
  {
    category: "RF Microneedling",
    id: "rf-microneedling",
    description: "Combined RF and microneedling for skin transformation.",
    treatments: ["Skin Tightening", "Wrinkle Reduction", "Scar Treatment", "Texture Improvement", "Pore Refinement"],
    image: mediaId("services-medical-spa/hero/medical-spa-rf-microneedling"),
    path: "/services/medical-spa/rf-microneedling"
  },
  {
    category: "Cosmetic Injections",
    id: "cosmetic-injections",
    description: "Premium injectable treatments for facial enhancement.",
    treatments: ["Botox", "Dermal Fillers", "Lip Enhancement", "Jawline Contouring", "Under-eye Treatment"],
    image: mediaId("services-medical-spa/hero/medical-spa-injections"),
    path: "/services/medical-spa/cosmetic-injections"
  },
  {
    category: "Skin Lasers",
    id: "skin-lasers",
    description: "Advanced laser therapies for various skin concerns.",
    treatments: ["Hair Removal", "Skin Resurfacing", "Pigmentation", "Vascular Lesions", "Tattoo Removal"],
    image: mediaId("services-medical-spa/hero/medical-spa-lasers"),
    path: "/services/medical-spa/skin-lasers"
  },
  {
    category: "Esthetician Services",
    id: "esthetician-services",
    description: "Luxurious facial treatments for radiant skin.",
    treatments: ["Custom Facials", "Chemical Peels", "Dermaplaning", "LED Therapy", "Oxygen Treatment"],
    image: mediaId("services-medical-spa/hero/medical-spa-facials"),
    path: "/services/medical-spa/esthetician-services"
  }
]

export default function MedicalSpa() {
  return (
    <main className="min-h-screen bg-black">
      <Head>
        <title>Medical Spa Newport Beach | Luxury Aesthetic Treatments | Allure MD</title>
        <meta name="description" content="Experience the perfect blend of relaxation and cutting-edge aesthetic treatments at Allure MD's Medical Spa in Newport Beach." />
        <meta name="keywords" content="medical spa, Newport Beach, cosmetic injections, Botox, fillers, laser treatments, RF microneedling, EMSCULPT, esthetician services, luxury spa" />
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
            src="services/medical-spa/medical-spa-hero" 
            alt="Medical Spa at Allure MD" 
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
                  MEDICAL SPA
                </h1>
                <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Luxury meets advanced aesthetics
                </h2>
                <div className="space-y-4 text-lg font-cerebri font-light">
                  <p>
                    Experience the perfect blend of relaxation and cutting-edge aesthetic treatments at Allure MD's Medical Spa.
                    Our expert team delivers personalized care using the latest technologies and techniques.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                    <LearnMoreButton href="/gallery/medical-spa">View Before & After Gallery</LearnMoreButton>
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
              src="services/medical-spa/medical-spa-hero" 
              alt="Medical Spa at Allure MD" 
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
                MEDICAL SPA
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
                Luxury meets advanced aesthetics
              </h2>
              <div className="space-y-4 text-base font-cerebri font-light">
                <p>
                  Experience the perfect blend of relaxation and cutting-edge aesthetic treatments at Allure MD's Medical Spa.
                  Our expert team delivers personalized care using the latest technologies and techniques.
                </p>
                <div className="flex flex-col space-y-4 mt-6">
                  <LearnMoreButton href="/appointment">Schedule an Appointment</LearnMoreButton>
                  <LearnMoreButton href="/gallery/medical-spa">View Before & After Gallery</LearnMoreButton>
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
                    <LearnMoreButton href={category.externalLink || category.path || '#'}>
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
              Your Journey to Radiance
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Book your spa experience today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Transform your beauty and wellness journey with our luxurious medical spa treatments. Let our expert team guide you to your aesthetic goals.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule Your Appointment</LearnMoreButton>
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