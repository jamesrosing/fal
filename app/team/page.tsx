"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useEffect, useState } from "react"
import { TeamMember } from "@/lib/supabase"

function TeamMemberCard({ member, isPhysician = false }: { 
  member: TeamMember
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
          src={member.image_url}
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
  const [providers, setProviders] = useState<TeamMember[]>([])
  const [staff, setStaff] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch('/api/team')
        if (!response.ok) throw new Error('Failed to fetch team members')
        
        const data = await response.json()
        
        // Split into providers and staff
        setProviders(data.filter((member: TeamMember) => member.is_provider))
        setStaff(data.filter((member: TeamMember) => !member.is_provider))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team members')
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/c_fill,g_auto,f_auto,q_auto/team/team-hero.jpg"
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
              <TeamMemberCard key={provider.id} member={provider} isPhysician={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      {staff.length > 0 && (
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
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

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