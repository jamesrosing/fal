"use client"

import { motion } from "framer-motion"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CloudinaryImage } from '@/components/media/CloudinaryMedia'
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';



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
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero"
  },
  {
    category: "Breast",
    id: "breast",
    description: "Customized breast enhancement and reconstruction procedures.",
    procedures: ["Augmentation", "Lift", "Reduction", "Revision", "Nipple Areolar Complex"],
    imageId: "fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero"
  },
  {
    category: "Body",
    id: "body",
    description: "Comprehensive body contouring and refinement procedures.",
    procedures: ["Abdominoplasty", "Mini-Abdominoplasty", "Liposuction", "Arm Lift", "Thigh Lift"],
    imageId: "fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero"
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
      <section className="bg-black">
        {/* Mobile Hero with Image on top + Text below */}
        <div className="lg:hidden">
          {/* Media container with full width */}
          <div className="relative w-full aspect-[16/9]">
            <CloudinaryImage 
              id="page:services/plastic-surgery/plastic-surgery-hero.jpg" 
              alt="Plastic Surgery at Allure MD" 
              priority 
              fill 
              width={1920}
              height={1080}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          {/* Text content below image */}
          <div className="px-4 py-10 bg-black">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Plastic Surgery
              </h1>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Artistry in aesthetic transformation
              </h2>
              <div className="space-y-6 text-base font-cerebri font-light">
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
        
        {/* Desktop Hero with Text over Image */}
        <div className="hidden lg:block relative h-screen">
          <div className="absolute inset-0">
            <CloudinaryImage 
              id="page:services/plastic-surgery/plastic-surgery-hero.jpg" 
              alt="Plastic Surgery at Allure MD" 
              priority 
              fill 
              width={1920}
              height={1080}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
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
                <div className="space-y-6 text-base font-cerebri font-light">
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
        </div>
      </section>

      {/* Procedures Section */}
      <section className="bg-black">
          <div className="py-10 lg:py-16 px-0 lg:container lg:mx-auto lg:px-4">
            <div className="grid gap-16 lg:gap-20">
              {procedures.map((category, index) => (
                <motion.div
                  id={category.id}
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="scroll-mt-20"
                >
                  {/* Mobile View */}
                  <div className="lg:hidden">
                    {/* Full-width image container */}
                    <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] aspect-[4/3]">
                      <CloudinaryImage
                        id={category.imageId}
                        alt={category.category}
                        fill
                        width={800}
                        height={600}
                        className="object-cover"
                        sizes="100vw"
                      />
                    </div>
                    
                    {/* Text content with proper padding */}
                    <div className="px-4 py-8 bg-black">
                      <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
                        {category.category}
                      </h3>
                      <p className="mb-6 text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight font-serif text-white">
                        {category.description}
                      </p>
                      
                      <p className="text-base font-cerebri font-light leading-relaxed mb-8 text-white">
                        Our comprehensive {category.category.toLowerCase()} procedures include {category.procedures.join(", ")}, 
                        each tailored to enhance your natural features with precision and artistry.
                      </p>
                      
                      <div className="mt-6">
                        <LearnMoreButton href={`/services/plastic-surgery/${category.id}`}>
                          Learn More
                        </LearnMoreButton>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop View */}
                  <div className={`hidden lg:flex ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  } gap-10 items-center px-4 lg:px-0`}>
                    <div className="w-1/2">
                      <div className="relative aspect-[4/3] w-full">
                        <CloudinaryImage
                          id={category.imageId}
                          alt={category.category}
                          fill
                          width={800}
                          height={600}
                          className="object-cover w-full h-full"
                          sizes="50vw"
                        />
                      </div>
                    </div>
                    
                    <div className="w-1/2 text-white">
                      <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                        {category.category}
                      </h3>
                      <p className="mb-6 text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight font-serif">
                        {category.description}
                      </p>
                      
                      <p className="text-base font-cerebri font-light leading-relaxed mb-8">
                        Our comprehensive {category.category.toLowerCase()} procedures include {category.procedures.join(", ")}, 
                        each tailored to enhance your natural features with precision and artistry.
                      </p>
                      
                      <div className="mt-6">
                        <LearnMoreButton href={`/services/plastic-surgery/${category.id}`}>
                          Learn More
                        </LearnMoreButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-20 bg-[#f5f5f5] dark:bg-black">
        <div className="px-4 lg:container lg:mx-auto lg:px-8">
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
            <h3 className="mb-6 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light">
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