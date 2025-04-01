"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CloudinaryImage } from '@/components/CloudinaryImage'

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
    category: "FACE & NECK LIFT",
    id: "face-lift",
    description: "Redefine your facial contours with expert facelift procedures.",
    treatments: ["Complete Facelift", "Mini-Facelift", "Neck Lift", "Deep Plane Lift", "SMAS Facelift"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/face-lift-hero.jpg",
    path: "/services/plastic-surgery/head-and-neck?procedure=facelift"
  },
  {
    category: "EYELID SURGERY",
    id: "eyelid-surgery",
    description: "Rejuvenate your appearance with blepharoplasty procedures.",
    treatments: ["Upper Eyelid Surgery", "Lower Eyelid Surgery", "Ptosis Correction", "Asian Eyelid Surgery", "Canthopexy"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/eyelid-surgery-hero.jpg",
    path: "/services/plastic-surgery/head-and-neck?procedure=eyelids"
  },
  {
    category: "RHINOPLASTY",
    id: "rhinoplasty",
    description: "Sculpt your ideal nose profile with precision rhinoplasty.",
    treatments: ["Primary Rhinoplasty", "Revision Rhinoplasty", "Ethnic Rhinoplasty", "Functional Correction", "Tip Refinement"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/rhinoplasty-hero.jpg",
    path: "/services/plastic-surgery/head-and-neck?procedure=nose"
  },
  {
    category: "BREAST SURGERY",
    id: "breast-surgery",
    description: "Achieve your aesthetic goals with tailored breast procedures.",
    treatments: ["Breast Augmentation", "Breast Lift", "Breast Reduction", "Implant Revision", "Male Breast Reduction"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/plastic-surgery/breast-surgery-hero.jpg",
    path: "/services/plastic-surgery/breast"
  }
]

const awards = [
  { name: "Board Certified Plastic Surgeon", issuer: "American Board of Plastic Surgery" },
  { name: "Top Doctor", issuer: "Castle Connolly", year: "2023" },
  { name: "Best Facial Plastic Surgeon", issuer: "Orange County Register", year: "2022" },
  { name: "RealSelf Top Doctor", issuer: "RealSelf", year: "2023" },
  { name: "America's Top Plastic Surgeons", issuer: "Consumers' Research Council of America" }
]

const education = [
  { institution: "Yale University School of Medicine", degree: "Doctor of Medicine", year: "2005" },
  { institution: "UCLA Medical Center", program: "Plastic Surgery Residency", year: "2011" },
  { institution: "Manhattan Eye, Ear & Throat Hospital", program: "Aesthetic Fellowship", year: "2012" }
]

const reviews = [
  {
    platform: "Google",
    name: "Sarah L.",
    rating: 5,
    text: "Dr. Rosing performed my facelift and the results are absolutely amazing. I look 15 years younger but still natural. His expertise and artistic eye are unmatched in Orange County.",
    date: "March 2023"
  },
  {
    platform: "Yelp",
    name: "Michael T.",
    rating: 5,
    text: "After consultations with several surgeons, I chose Dr. Rosing for my eyelid surgery. His attention to detail and thorough explanation of the procedure gave me confidence. Recovery was quick and the results are phenomenal.",
    date: "January 2023"
  },
  {
    platform: "Google",
    name: "Jennifer R.",
    rating: 5,
    text: "I flew in from Chicago specifically to have Dr. Rosing perform my facelift. His reputation is well-deserved. The entire experience from consultation to recovery exceeded my expectations.",
    date: "November 2022"
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
          <CloudinaryImage
            publicId="plastic-surgery/dr-rosing-hero"
            alt="Dr. James Rosing, Board Certified Plastic Surgeon"
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
                Dr. James Rosing
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Internationally renowned for facial rejuvenation
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Dr. Rosing is a board-certified plastic surgeon with over 15 years of expertise specializing in facelifts and eyelid surgery. Patients travel from around the world to benefit from his surgical precision and natural-looking results.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment?specialist=dr-rosing">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery">View Before & After Gallery</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-white"
          >
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/3">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
                  <Image
                    src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/dr-james-rosing-portrait.jpg"
                    alt="Dr. James Rosing"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h2 className="mb-6 text-3xl font-serif">About Dr. Rosing</h2>
                <div className="space-y-4 text-lg font-cerebri font-light">
                  <p>
                    Dr. James Rosing is a double board-certified plastic surgeon specializing in facial plastic surgery. After earning his medical degree from Yale University, he completed his residency at UCLA Medical Center and an aesthetic fellowship at the prestigious Manhattan Eye, Ear & Throat Hospital.
                  </p>
                  <p>
                    With over 15 years of experience, Dr. Rosing has developed innovative techniques for facial rejuvenation that deliver natural-looking results with minimal downtime. His dedication to facial aesthetics has made him a sought-after surgeon for patients worldwide seeking facelifts and eyelid procedures.
                  </p>
                  <p>
                    Dr. Rosing takes pride in understanding each patient's unique facial anatomy and aesthetic goals. His personalized approach ensures results that enhance natural beauty rather than creating an artificial appearance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-24">
            {procedures.map((procedure, index) => (
              <motion.div
                id={procedure.id}
                key={procedure.category}
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
                      src={procedure.image}
                      alt={procedure.category}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-white">
                  <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    {procedure.category}
                  </h3>
                  <p className="mb-8 text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-tight font-serif">
                    {procedure.description}
                  </p>
                  <ul className="space-y-4">
                    {procedure.treatments.map((treatment) => (
                      <li key={treatment} className="flex items-center space-x-4">
                        <span className="w-8 h-[1px] bg-white"></span>
                        <span className="text-lg font-cerebri font-light">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <LearnMoreButton href={procedure.path}>
                      Learn More
                    </LearnMoreButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-white"
          >
            <h2 className="text-center mb-8 text-3xl font-serif">Credentials & Recognition</h2>
            
            <div className="grid md:grid-cols-2 gap-16 mb-16">
              <div>
                <h3 className="mb-6 text-xl font-cerebri uppercase tracking-wide">Awards & Recognition</h3>
                <ul className="space-y-6">
                  {awards.map((award, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <span className="w-8 h-[1px] bg-white mt-3"></span>
                      <div>
                        <p className="text-lg font-cerebri font-normal">{award.name}</p>
                        <p className="text-sm font-cerebri font-light text-gray-400">
                          {award.issuer} {award.year && `(${award.year})`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="mb-6 text-xl font-cerebri uppercase tracking-wide">Education & Training</h3>
                <ul className="space-y-6">
                  {education.map((edu, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <span className="w-8 h-[1px] bg-white mt-3"></span>
                      <div>
                        <p className="text-lg font-cerebri font-normal">{edu.institution}</p>
                        <p className="text-sm font-cerebri font-light text-gray-400">
                          {edu.degree || edu.program} ({edu.year})
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-cerebri">
                <span className="text-4xl font-serif">15+</span><br />
                years of specialized experience
              </p>
              <p className="mt-8 text-lg font-cerebri">
                <span className="text-4xl font-serif">5000+</span><br />
                successful procedures performed
              </p>
              <p className="mt-8 text-lg font-cerebri">
                <span className="text-4xl font-serif">25+</span><br />
                countries represented in patient base
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-white"
          >
            <h2 className="text-center mb-12 text-3xl font-serif">Patient Testimonials</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <div key={index} className="bg-gray-900 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-cerebri font-normal">{review.name}</p>
                        <p className="text-xs text-gray-400">{review.platform} • {review.date}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="font-cerebri font-light text-gray-300">"{review.text}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <LearnMoreButton href="/reviews">
                View All Reviews
              </LearnMoreButton>
            </div>
          </motion.div>
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
              Transform Your Appearance
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your consultation with Dr. Rosing
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Experience the artistry and precision of Dr. Rosing's approach to plastic surgery. Whether you're considering a facelift, eyelid surgery, or other aesthetic procedures, your journey to rejuvenation begins with a personalized consultation.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment?specialist=dr-rosing">Schedule Your Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/financing">Learn About Financing Options</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 