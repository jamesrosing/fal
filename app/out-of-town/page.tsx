"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { MapPin, Plane, Hotel, Car, Phone, Calendar } from "lucide-react"

const services = [
  {
    title: "Virtual Consultations",
    description: "Begin your journey from anywhere with secure video consultations.",
    icon: Phone,
    details: [
      "Initial assessment and planning",
      "Treatment recommendations",
      "Recovery timeline discussion",
      "Cost estimates and financing options"
    ]
  },
  {
    title: "Travel Planning",
    description: "Comprehensive assistance with all travel arrangements.",
    icon: Plane,
    details: [
      "Flight booking assistance",
      "Airport transportation",
      "Local travel recommendations",
      "Itinerary coordination"
    ]
  },
  {
    title: "Accommodations",
    description: "Luxury lodging options near our facility.",
    icon: Hotel,
    details: [
      "Premium hotel partnerships",
      "Extended stay apartments",
      "Recovery-friendly amenities",
      "Concierge services"
    ]
  },
  {
    title: "Local Transportation",
    description: "Reliable transportation throughout your stay.",
    icon: Car,
    details: [
      "Airport pickup and drop-off",
      "Transportation to appointments",
      "Local area guidance",
      "24/7 availability"
    ]
  }
]

const locations = [
  {
    name: "Fashion Island Hotel",
    distance: "0.5 miles",
    description: "Luxury accommodations with recovery-friendly amenities",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/locations/fashion-island-hotel.jpg"
  },
  {
    name: "The Resort at Pelican Hill",
    distance: "3.2 miles",
    description: "Five-star resort with private bungalows and full service spa",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/locations/pelican-hill.jpg"
  },
  {
    name: "Lido House, Autograph Collection",
    distance: "2.1 miles",
    description: "Boutique hotel with personalized service and coastal charm",
    image: "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/locations/lido-house.jpg"
  }
]

export default function OutOfTownPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/hero/out-of-town-hero.jpg"
            alt="Out of Town Patients"
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
                Out of Town Patients
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Your destination for exceptional care
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Experience world-class aesthetic treatments in beautiful Newport Beach. We provide comprehensive support for our traveling patients, ensuring a seamless and comfortable experience from start to finish.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Virtual Consultation</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Travel Support
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Comprehensive assistance for our traveling patients
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-zinc-900 p-8 rounded-lg"
              >
                <service.icon className="w-12 h-12 text-white mb-6" />
                <h4 className="text-xl font-serif text-white mb-4">{service.title}</h4>
                <p className="text-gray-400 font-cerebri font-light mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.details.map((detail) => (
                    <li key={detail} className="text-gray-400 font-cerebri font-light flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Where to Stay
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Luxury accommodations near our facility
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {locations.map((location) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-black rounded-lg overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm font-cerebri">{location.distance}</span>
                  </div>
                  <h4 className="text-xl font-serif text-white mb-2">{location.name}</h4>
                  <p className="text-gray-400 font-cerebri font-light">{location.description}</p>
                </div>
              </motion.div>
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
              Begin Your Journey
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Let us help plan your visit
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Our dedicated patient care coordinators are here to assist with every aspect of your visit to Newport Beach.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Virtual Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/contact">Contact Our Travel Coordinator</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 