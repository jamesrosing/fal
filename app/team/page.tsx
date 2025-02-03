"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const teamMembers = [
  {
    name: "Dr. James Rosing",
    role: "Board-Certified Plastic Surgeon",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dr-rosing.webp",
    credentials: "MD, FACS",
    specialties: ["Facial Plastic Surgery", "Body Contouring", "Breast Surgery"],
    education: [
      "Harvard Medical School",
      "Stanford University Plastic Surgery Residency",
      "Aesthetic Surgery Fellowship"
    ],
    description: "Dr. Rosing brings over 15 years of experience in aesthetic and reconstructive plastic surgery. His artistic vision and technical expertise have earned him recognition as one of Southern California's leading plastic surgeons."
  },
  {
    name: "Susan Pearose, PA-C",
    role: "Board-Certified Dermatology Physician Assistant",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dr-chen.webp",
    credentials: "PA-C",
    specialties: ["Medical Dermatology", "Skin Cancer Management","Cosmetic Dermatology", "Laser Treatments"],

    education: [

      "Yale School of Medicine",
      "University of California Dermatology Residency",
      "Procedural Dermatology Fellowship"
    ],
    description: "Dr. Chen specializes in both medical and cosmetic dermatology, with particular expertise in laser treatments and minimally invasive procedures for skin rejuvenation."
  }
]

const staffMembers = [
  {
    name: "Julia Kowalczyk",
    role: "Medical Esthetician, Skin Care Specialist",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nurse-jennifer.webp",
    credentials: "Licensed Esthetician",
    specialties: ["Injectable Treatments", "Emsculpt Provider","Laser Procedures", "Skin Care"]
  },
  {
    name: "Rachelle Gallardo",
    role: "Practice Manager",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/manager-michael.webp",
    credentials: "20 Years of Plastic Surgery and Dermatology Experience",
    specialties: ["Patient Experience", "Practice Operations", "Quality Assurance"]
  }
]

function TeamMemberCard({ member, isPhysician = false }: { 
  member: typeof teamMembers[0] | typeof staffMembers[0]
  isPhysician?: boolean 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="flex flex-col lg:flex-row gap-8 items-start"
    >
      <div className="w-full lg:w-1/3">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>
      </div>
      
      <div className="w-full lg:w-2/3 space-y-4">
        <div>
          <h3 className="text-2xl font-serif">{member.name}</h3>
          <p className="text-lg font-cerebri text-gray-400">{member.role}</p>
          {member.credentials && (
            <p className="text-sm font-cerebri text-gray-400">{member.credentials}</p>
          )}
        </div>
        
        {'education' in member && (
          <div>
            <h4 className="text-sm font-cerebri uppercase tracking-wide text-gray-400 mb-2">Education</h4>
            <ul className="space-y-1">
              {member.education.map((edu, index) => (
                <li key={index} className="text-base font-cerebri">{edu}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-cerebri uppercase tracking-wide text-gray-400 mb-2">Specialties</h4>
          <ul className="space-y-1">
            {member.specialties.map((specialty, index) => (
              <li key={index} className="text-base font-cerebri">{specialty}</li>
            ))}
          </ul>
        </div>
        
        {'description' in member && (
          <p className="text-base font-cerebri font-light">{member.description}</p>
        )}
        
        {isPhysician && (
          <div className="pt-4">
            <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Team() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/team-hero.webp"
            alt="Our Team at Allure MD"
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
                Our Team
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Meet our exceptional providers
              </h2>
              <p className="text-lg font-cerebri font-light">
                Our team of board-certified physicians and experienced medical professionals is dedicated to 
                providing exceptional care and achieving outstanding results for our patients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Physicians Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-400">
                Physicians
              </h2>
              <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
                Expert care from trusted professionals
              </h3>
            </div>
            
            <div className="space-y-24">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} isPhysician={true} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-400">
                Medical Staff
              </h2>
              <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
                Supporting your journey
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-16">
              {staffMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-400">
              Start Your Journey
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Take the first step towards achieving your aesthetic goals with our expert team.
                We&apos;re here to guide you through your transformation journey.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 