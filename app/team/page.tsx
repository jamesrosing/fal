"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"

const providers = [
  {
    name: "James Rosing",
    title: "MD, FACS",
    role: "Board Certified Plastic Surgeon",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/dr-rosing.jpg",
    description: "Dr. Rosing is a highly skilled board-certified plastic surgeon known for his artistic eye and commitment to natural-looking results. With years of experience in aesthetic and reconstructive surgery, he provides personalized care to help patients achieve their aesthetic goals.",
  },
  {
    name: "Susan Pearose",
    title: "PA-C",
    role: "Dermatology Certified Physician Assistant",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/susan-pearose.jpg",
    description: "Susan is a certified physician assistant specializing in dermatology. Her expertise in skin health and aesthetic treatments, combined with her patient-centered approach, helps clients achieve and maintain healthy, radiant skin.",
  },
  {
    name: "Julie Bandy",
    title: "",
    role: "Certified Medical Esthetician and Skin Care Specialist",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/julie-bandy.jpg",
    description: "Julie brings extensive experience in advanced skincare treatments and medical aesthetics. Her expertise in customized facial treatments and skincare protocols helps clients achieve their best skin ever.",
  },
  {
    name: "Pooja Gidwani",
    title: "MD",
    role: "Board Certified Physician, Functional Medicine",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/dr-gidwani.jpg",
    description: "Dr. Gidwani specializes in functional medicine, focusing on identifying and treating root causes of health issues. Her comprehensive approach to wellness helps patients achieve optimal health through personalized treatment plans.",
  }
]

const staff = [
  {
    name: "Rachelle Gallardo",
    role: "Practice Manager and Patient Care Coordinator",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/rachelle-gallardo.jpg",
    description: "Rachelle ensures smooth operations of the practice while maintaining the highest standards of patient care and service. Her dedication to excellence helps create an exceptional experience for every patient.",
  }
]

function TeamMemberCard({ member, isPhysician = false }: { 
  member: typeof providers[0] | typeof staff[0]
  isPhysician?: boolean 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-serif">
          {member.name}
          {isPhysician && member.title && <span className="ml-2 text-zinc-300">{member.title}</span>}
        </h3>
        <p className="mt-1 text-sm text-zinc-300">{member.role}</p>
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
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/team/team-hero.jpg"
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
                Meet our expert providers and staff
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our team of experienced medical professionals is dedicated to providing exceptional care
                  and helping you achieve your aesthetic and wellness goals.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-zinc-500">
              Our Providers
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Expert care from experienced professionals
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider) => (
              <TeamMemberCard key={provider.name} member={provider} isPhysician={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-zinc-500">
              Our Staff
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Supporting your journey
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {staff.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Schedule your consultation
            </h2>
            <p className="text-lg text-zinc-300 mb-8 font-cerebri font-light">
              Take the first step towards achieving your aesthetic and wellness goals with our expert team.
            </p>
            <LearnMoreButton href="/consultation">Book a Consultation</LearnMoreButton>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 