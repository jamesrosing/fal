"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const physicians = [
  {
    name: "Dr. Sarah Johnson",
    title: "Medical Director, Board-Certified Plastic Surgeon",
    specialties: ["Facial Rejuvenation", "Breast Surgery", "Body Contouring"],
    education: ["MD - Harvard Medical School", "Residency - Johns Hopkins"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/dr-johnson.jpg"
  },
  {
    name: "Dr. Michael Chen",
    title: "Board-Certified Dermatologist",
    specialties: ["Medical Dermatology", "Cosmetic Dermatology", "Laser Treatments"],
    education: ["MD - Stanford University", "Residency - UCLA"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/dr-chen.jpg"
  }
]

const staff = [
  {
    name: "Emily Rodriguez",
    title: "Lead Aesthetic Nurse",
    specialties: ["Injectable Treatments", "Laser Procedures", "Skin Care"],
    certifications: ["RN", "Certified Aesthetic Nurse Specialist"],
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/nurse-rodriguez.jpg"
  },
  {
    name: "David Kim",
    title: "Patient Care Coordinator",
    specialties: ["Treatment Planning", "Patient Education", "Recovery Support"],
    experience: "10+ years in aesthetic medicine",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/coordinator-kim.jpg"
  }
]

function TeamMemberCard({ member, isPhysician = false }: { 
  member: typeof physicians[0] | typeof staff[0]
  isPhysician?: boolean 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-zinc-900 rounded-lg overflow-hidden"
    >
      <div className="relative aspect-[3/4] mb-6">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif text-white mb-2">{member.name}</h3>
        <p className="text-gray-400 font-cerebri font-light mb-4">{member.title}</p>
        
        <div className="space-y-4">
          {member.specialties && (
            <div>
              <h4 className="text-sm font-cerebri uppercase tracking-wide text-white mb-2">Specialties</h4>
              <ul className="text-gray-400 font-cerebri font-light space-y-1">
                {member.specialties.map((specialty) => (
                  <li key={specialty}>{specialty}</li>
                ))}
              </ul>
            </div>
          )}
          
          {isPhysician && 'education' in member && (
            <div>
              <h4 className="text-sm font-cerebri uppercase tracking-wide text-white mb-2">Education</h4>
              <ul className="text-gray-400 font-cerebri font-light space-y-1">
                {member.education.map((edu) => (
                  <li key={edu}>{edu}</li>
                ))}
              </ul>
            </div>
          )}
          
          {'certifications' in member && (
            <div>
              <h4 className="text-sm font-cerebri uppercase tracking-wide text-white mb-2">Certifications</h4>
              <ul className="text-gray-400 font-cerebri font-light space-y-1">
                {member.certifications.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
          
          {'experience' in member && (
            <div>
              <h4 className="text-sm font-cerebri uppercase tracking-wide text-white mb-2">Experience</h4>
              <p className="text-gray-400 font-cerebri font-light">{member.experience}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Team() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/hero.jpg"
            alt="Our Team"
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
                Expert care from experienced professionals
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Meet our team of board-certified physicians, skilled nurses, and dedicated staff members who are committed to providing you with exceptional care and outstanding results.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Physicians Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Our Physicians
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Board-certified expertise
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {physicians.map((physician) => (
              <TeamMemberCard
                key={physician.name}
                member={physician}
                isPhysician={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Our Staff
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Dedicated to your care
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {staff.map((member) => (
              <TeamMemberCard
                key={member.name}
                member={member}
              />
            ))}
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
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Meet Our Team in Person
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Schedule your consultation today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Experience personalized care and expert guidance from our team of professionals.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 