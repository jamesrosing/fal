"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import Script from "next/script"

const contactMethods = [
  {
    title: "Call Us",
    description: "Speak directly with our patient care team",
    icon: Phone,
    action: "949-706-7874",
    href: "tel:9497067874",
    isHighlighted: true
  },
  {
    title: "Visit Us",
    description: "Allure MD Plastic Surgery + Dermatology\n1441 Avocado Ave. Suite 708,\nNewport Beach, CA 92660",
    icon: MapPin,
    action: "Get Directions",
    href: "https://maps.apple.com/?address=1441%20Avocado%20Ave,%20Newport%20Beach,%20CA%20%2092660,%20United%20States&auid=18339372791188327544&ll=33.609795,-117.875650&lsp=9902&q=Allure%20MD%20Plastic%20Surgery%20%26%20Dermatology",
    isHighlighted: false
  },
  {
    title: "Hours",
    description: "Monday - Friday: 9am - 5pm",
    icon: Clock,
    action: "Schedule Now",
    href: "/appointment",
    isHighlighted: false
  },
  {
    title: "Chat",
    description: "Message us directly for quick responses",
    icon: MessageCircle,
    action: "Start Chat",
    href: "#chat", // This will be handled by your chat widget
    isHighlighted: true
  }
]

export default function ContactPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)

  useEffect(() => {
    if (typeof google === 'undefined' || mapInitialized.current) return

    const initMap = () => {
      if (!mapRef.current) return

      const location = { lat: 33.609795, lng: -117.875650 }
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: location,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#242f3e" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#746855" }]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#d59563" }]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#d59563" }]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#263c3f" }]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#6b9a76" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#38414e" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#212a37" }]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9ca5b3" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{ "color": "#746855" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#1f2835" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#f3d19c" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#17263c" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#515c6d" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#17263c" }]
          }
        ]
      })

      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Allure MD Plastic Surgery + Dermatology"
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">Allure MD Plastic Surgery + Dermatology</h3>
            <p style="margin: 0;">1441 Avocado Ave. Suite 708<br>Newport Beach, CA 92660</p>
          </div>
        `
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })

      mapInitialized.current = true
    }

    if (typeof google !== 'undefined') {
      initMap()
    }
  }, [])

  return (
    <main className="min-h-screen bg-black">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        onLoad={() => {
          if (!mapInitialized.current) {
            const event = new Event('google-maps-ready')
            window.dispatchEvent(event)
          }
        }}
      />
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/hero/1441-1401-avocado-avenue.jpg"
            alt="Contact Allure MD"
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
              Contact Us
            </h1>
            <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              Get in touch with our team
            </h2>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our dedicated patient care team is here to assist you with any questions about our services, scheduling, or general inquiries. Reach out to us through your preferred method of contact.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "p-8 rounded-lg border",
                  method.isHighlighted 
                    ? "bg-zinc-900 border-zinc-800" 
                    : "bg-black border-zinc-900"
                )}
              >
                <method.icon className="w-6 h-6 text-white mb-6" />
                <h3 className="text-2xl font-serif text-white mb-4">{method.title}</h3>
                <p className="whitespace-pre-line text-gray-400 font-cerebri font-light mb-8">{method.description}</p>
                <LearnMoreButton href={method.href}>
                  {method.action}
                </LearnMoreButton>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
              Our Location
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Visit our Newport Beach office
            </h3>
          </motion.div>

          <div ref={mapRef} className="w-full aspect-[16/9] rounded-lg overflow-hidden" />
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
              Ready to Begin?
            </h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Take the first step today
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
              <p>
                Whether you're ready to schedule an appointment or just have questions, we're here to help you achieve your aesthetic goals.
              </p>
              <div>
                <LearnMoreButton href="tel:9497067874">Call 949-706-7874</LearnMoreButton>
                <br />
                <LearnMoreButton href="/appointment">Schedule Online</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 