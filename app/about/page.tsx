"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { getImageUrl } from "@/lib/image-config"

const values = [
  {
    title: "Excellence",
    description: "Commitment to the highest standards of medical care and aesthetic results.",
    icon: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1734100329/icons/excellence-icon_wgbnap.png"
  },
  {
    title: "Innovation",
    description: "Utilizing the latest technologies and techniques in aesthetic medicine.",
    icon: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1734100329/icons/innovation-icon_jdajrg.png"
  },
  {
    title: "Safety",
    description: "Prioritizing patient safety and well-being in every procedure.",
    icon: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1734100329/icons/safety-icon_qpwl4v.png"
  },
  {
    title: "Personalization",
    description: "Tailoring treatments to each patient's unique goals and anatomy.",
    icon: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1734100329/icons/personalization-icon_rgyipk.png"
  }
]

const facilities = [
  {
    title: "State-of-the-Art Operating Rooms",
    description: "Fully accredited surgical facilities with advanced equipment",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/facilities/operating-room.jpg"
  },
  {
    title: "Luxury Recovery Suites",
    description: "Private, comfortable spaces for post-procedure recovery",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/facilities/recovery-suite.jpg"
  },
  {
    title: "Advanced Treatment Rooms",
    description: "Specialized spaces for non-surgical procedures and treatments",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/facilities/treatment-room.jpg"
  }
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1739333317/hero/hero-about.jpg"
            alt="About Allure MD"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Hero Text Content */}
        <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              About Us
            </h1>
            <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              Excellence in aesthetic medicine
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                At Allure MD, we combine artistic vision with surgical precision to help our patients achieve their aesthetic goals. Our commitment to excellence, innovation, and patient care sets us apart in the field of aesthetic medicine.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Our Mission
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Transforming lives through excellence in aesthetic medicine
            </h3>
            <p className="text-lg font-cerebri font-light">
              Our mission is to provide exceptional aesthetic medical care in a luxurious, comfortable environment. We are dedicated to helping our patients achieve their aesthetic goals while maintaining the highest standards of safety and medical excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              Our Values
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              What drives us forward
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center text-white"
              >
                <div className="mb-6 p-4 bg-zinc-800 rounded-full inline-block mx-auto">
                  <Image
                    src={value.icon}
                    alt={value.title}
                    width={80}
                    height={80}
                    className="mx-auto object-contain"
                  />
                </div>
                <h4 className="text-xl font-serif mb-4">{value.title}</h4>
                <p className="text-gray-400 font-cerebri font-light">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
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
              Our Facilities
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              State-of-the-art care in luxury surroundings
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <motion.div
                key={facility.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-white"
              >
                <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-xl font-serif mb-2">{facility.title}</h4>
                <p className="text-gray-400 font-cerebri font-light">{facility.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Begin Your Journey
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Experience the Allure MD difference
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Take the first step towards achieving your aesthetic goals with our expert team of professionals.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 