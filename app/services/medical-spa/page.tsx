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

const treatments = [
  {
    category: "EMSCULPT NEWPORT BEACH",
    id: "emsculpt",
    description: "Advanced non-invasive body sculpting treatments.",
    treatments: ["Muscle Building", "Fat Reduction", "Core Strengthening", "Buttocks Toning", "Arms & Calves"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-emsculpt.webp",
    externalLink: "https://emsculpt-newportbeach.com"
  },
  {
    category: "Body Analysis",
    id: "body-analysis",
    description: "Precise 3D body scanning and progress tracking.",
    treatments: ["3D Body Scanning", "Progress Tracking", "Body Composition", "Measurements", "Visual Progress"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-shapescale.webp",
    path: "/services/medical-spa/body-analysis"
  },
  {
    category: "Skin Rejuvenation",
    id: "skin-rejuvenation",
    description: "Combined RF and microneedling for skin transformation.",
    treatments: ["Skin Tightening", "Wrinkle Reduction", "Scar Treatment", "Texture Improvement", "Pore Refinement"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-rf-microneedling.webp",
    path: "/services/medical-spa/skin-rejuvenation"
  },
  {
    category: "Injectable Treatments",
    id: "injectables",
    description: "Premium injectable treatments for facial enhancement.",
    treatments: ["Botox", "Dermal Fillers", "Lip Enhancement", "Jawline Contouring", "Under-eye Treatment"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-injections.webp",
    path: "/services/medical-spa/injectables"
  },
  {
    category: "Laser Treatments",
    id: "laser-treatments",
    description: "Advanced laser therapies for various skin concerns.",
    treatments: ["Hair Removal", "Skin Resurfacing", "Pigmentation", "Vascular Lesions", "Tattoo Removal"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-lasers.webp",
    path: "/services/medical-spa/laser-treatments"
  },
  {
    category: "Facial Treatments",
    id: "facial-treatments",
    description: "Luxurious facial treatments for radiant skin.",
    treatments: ["Custom Facials", "Chemical Peels", "Dermaplaning", "LED Therapy", "Oxygen Treatment"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-facials.webp",
    path: "/services/medical-spa/facial-treatments"
  }
]

export default function MedicalSpa() {
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
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-spa-hero.webp"
            alt="Medical Spa at Allure MD"
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
                Medical Spa
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Luxury meets advanced aesthetics
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience the perfect blend of relaxation and cutting-edge aesthetic treatments at Allure MD&apos;s Medical Spa.
                  Our expert team delivers personalized care using the latest technologies and techniques.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
                  <br />
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