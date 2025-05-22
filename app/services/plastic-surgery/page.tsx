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

const procedures = [
  {
    category: "Head & Neck",
    id: "head-and-neck",
    description: "Refined procedures for facial rejuvenation and harmony.",
    procedures: ["Eyelids", "Ears", "Face", "Neck", "Nose"],
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero",
    treatments: {
      "Face & Neck Lift": ["Complete Facelift", "Mini-Facelift", "Neck Lift", "Deep Plane Lift", "SMAS Facelift"],
      "Eyelid Surgery": ["Upper Eyelid Surgery", "Lower Eyelid Surgery", "Ptosis Correction", "Asian Eyelid Surgery", "Canthopexy"],
      "Rhinoplasty": ["Primary Rhinoplasty", "Revision Rhinoplasty", "Ethnic Rhinoplasty", "Functional Correction", "Tip Refinement"]
    }
  },
  {
    category: "Breast",
    id: "breast",
    description: "Customized breast enhancement and reconstruction procedures.",
    procedures: ["Augmentation", "Lift", "Reduction", "Revision", "Nipple Areolar Complex"],
    imageId: "fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero",
    treatments: ["Breast Augmentation", "Breast Lift", "Breast Reduction", "Implant Revision", "Male Breast Reduction"]
  },
  {
    category: "Body",
    id: "body",
    description: "Comprehensive body contouring and refinement procedures.",
    procedures: ["Abdominoplasty", "Mini-Abdominoplasty", "Liposuction", "Arm Lift", "Thigh Lift"],
    imageId: "fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero",
    treatments: ["Tummy Tuck", "Mini-Tummy Tuck", "Liposuction", "Arm Lift", "Thigh Lift", "Mommy Makeover", "Post-Weight Loss Surgery"]
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

const contact = {
  address: "1441 Avocado Avenue, Suite 708",
  city: "Newport Beach, California 92660",
  email: "drrosing@allure-md",
  phone: "949.706.7874",
  fax: "949.706.7817"
}

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
      <Head>
        <title>Plastic Surgery Newport Beach | Dr. James Rosing, MD, FACS | Allure MD</title>
        <meta name="description" content="Board certified plastic surgeon Dr. James Rosing specializes in facial plastic surgery, breast procedures & body contouring in Newport Beach. Natural results with minimal downtime." />
        <meta name="keywords" content="plastic surgeon Newport Beach, facial plastic surgery, facelift, necklift, eyelid lift, browlift, breast augmentation, breast reduction, breast lift, nipple inversion, body contouring, liposuction, abdominoplasty, tummy tuck, Dr. James Rosing MD FACS" />
        <meta property="og:title" content="Plastic Surgery Newport Beach | Dr. James Rosing, MD, FACS | Allure MD" />
        <meta property="og:description" content="Board certified plastic surgeon Dr. James Rosing specializes in facial plastic surgery, breast procedures & body contouring in Newport Beach." />
        <meta property="og:url" content="https://allure-md.com/services/plastic-surgery" />
        <meta property="og:type" content="website" />
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
            src="services/plastic-surgery/plastic-surgery-hero" 
            alt="Plastic Surgery at Allure MD" 
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
            <div className="container mx-auto px-8 py-16">
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
                    At Allure MD, our board-certified plastic surgeons combine surgical expertise with an artistic vision to enhance your natural beauty.
                    Led by Dr. James Rosing, we specialize in facial aesthetic surgery, breast procedures, and body contouring with personalized care and exceptional results.
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
        
        {/* Mobile Hero */}
        <div className="lg:hidden h-full flex flex-col">
          {/* Image container with aspect ratio */}
          <div className="relative w-full aspect-[16/9] mt-16">
            <CldImage 
              src="services/plastic-surgery/plastic-surgery-hero" 
              alt="Plastic Surgery at Allure MD" 
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
            
            {/* Title overlay at bottom of image */}
            <div className="absolute inset-0 flex items-end">
              <div className="px-4 py-6 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-white"
                >
                  <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                    Plastic Surgery
                  </h1>
                  <h2 className="mb-4 text-[clamp(2rem,5vw,3rem)] leading-none tracking-tight font-serif">
                    Artistry in aesthetic transformation
                  </h2>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Text content below image */}
          <div className="px-4 py-6 bg-black flex-grow">
            <div className="space-y-6 text-base font-cerebri font-light text-white">
              <p>
                At Allure MD, our board-certified plastic surgeons combine surgical expertise with an artistic vision to enhance your natural beauty. 
                Led by Dr. James Rosing, we specialize in facial aesthetic surgery, breast procedures, and body contouring with personalized care and exceptional results.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/gallery">View Before & After Gallery</LearnMoreButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Dr. Rosing Section */}
      <section className="py-16 lg:py-24 bg-black">
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
                  <CldImage 
                    src="team/dr-james-rosing-portrait" 
                    alt="Dr. James Rosing" 
                    fill
                    className="object-cover" 
                    config={{
                      cloud: {
                        cloudName: 'dyrzyfg3w'
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <h2 className="mb-6 text-3xl font-serif">About Dr. James Rosing, Board Certified Plastic Surgeon</h2>
                <div className="space-y-4 text-lg font-cerebri font-light">
                  <p>
                    Dr. James Rosing, MD, FACS is a board certified plastic and reconstructive surgeon specializing in facial aesthetic plastic surgery. His expertise includes facelift, necklift, eyelid lift, browlift, earlobe enhancement, and ear pinning procedures that deliver natural-looking results with minimal downtime.
                  </p>
                  <p>
                    Dr. Rosing is also well known for excellence in plastic surgery of the breast, including augmentation, revision breast implant surgery, breast reduction and lift surgery, and nipple inversion correction. His body contouring expertise features etching liposuction for male and female fit abdominal shaping and abdominoplasty designed to correct diastasis after multiple childbirths.
                  </p>
                  <p>
                    Beyond his clinical expertise, Dr. Rosing has contributed to the field through research on autologous fat grafting for breast augmentation and innovative nipple reconstruction techniques. As an accomplished athlete with Ironman and marathon completions, he brings the same dedication and precision to his surgical practice that has made him a sought-after surgeon for patients worldwide.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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
                      <CldImage
                        src={category.imageId}
                        alt={category.category}
                        fill
                        width={800}
                        height={600}
                        className="object-cover"
                        sizes="100vw"
                        config={{
                          cloud: {
                            cloudName: 'dyrzyfg3w'
                          }
                        }}
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
                        <CldImage
                          src={category.imageId}
                          alt={category.category}
                          fill
                          width={800}
                          height={600}
                          className="object-cover w-full h-full"
                          sizes="50vw"
                          config={{
                            cloud: {
                              cloudName: 'dyrzyfg3w'
                            }
                          }}
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

      {/* Credentials Section */}
      <section className="py-16 lg:py-24 bg-gray-950">
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
            
            <div className="text-center grid grid-cols-1 md:grid-cols-3 gap-8">
              <p className="text-lg font-cerebri">
                <span className="text-4xl font-serif">15+</span><br />
                years of specialized experience
              </p>
              <p className="text-lg font-cerebri">
                <span className="text-4xl font-serif">1000+</span><br />
                facial aesthetic procedures
              </p>
              <p className="text-lg font-cerebri">
                <span className="text-4xl font-serif">2500+</span><br />
                breast and body procedures
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 lg:py-24 bg-black">
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
              Transform Your Appearance
            </h2>
            <h3 className="mb-6 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light">
              <p>
                Experience the artistry and precision of our approach to plastic surgery. Whether you're considering a facelift, eyelid surgery, or other aesthetic procedures, your journey to rejuvenation begins with a personalized consultation with Dr. Rosing or another member of our surgical team.
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

      {/* Contact Information */}
      <section className="py-16 lg:py-24 bg-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-white"
          >
            <h2 className="text-center mb-12 text-3xl font-serif">Contact Dr. Rosing</h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
              <div>
                <h3 className="mb-6 text-xl font-cerebri uppercase tracking-wide">Office Location</h3>
                <p className="text-lg font-cerebri font-light">{contact.address}</p>
                <p className="text-lg font-cerebri font-light">{contact.city}</p>
              </div>
              
              <div>
                <h3 className="mb-6 text-xl font-cerebri uppercase tracking-wide">Contact Information</h3>
                <p className="text-lg font-cerebri font-light">Email: {contact.email}</p>
                <p className="text-lg font-cerebri font-light">Phone: {contact.phone}</p>
                <p className="text-lg font-cerebri font-light">Fax: {contact.fax}</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 