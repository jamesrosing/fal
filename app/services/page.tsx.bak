import { NavBar } from "@/components/nav-bar"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import { generateMetadata } from "@/components/seo/metadata"
import { PageHero } from "@/components/ui/page-hero"
import { Section } from "@/components/ui/section"

export const metadata = generateMetadata({
  title: 'Our Services',
  description: 'Discover our comprehensive range of aesthetic services including plastic surgery, dermatology, medical spa treatments, and functional medicine.',
  image: {
    path: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-services',
    alt: 'Our Services'
  }
})

const services = [
  {
    title: "Plastic Surgery",
    description: "Transform with confidence through our advanced surgical procedures.",
    image: "services/plastic-surgery-hero",
    href: "/services/plastic-surgery",
    categories: ["Face", "Breast", "Body"]
  },
  {
    title: "Dermatology",
    description: "Expert skincare solutions for healthy, radiant skin at any age.",
    image: "services/dermatology-hero",
    href: "/services/dermatology",
    categories: ["Medical", "Cosmetic", "Surgical"]
  },
  {
    title: "Medical Spa",
    description: "Non-invasive treatments for natural-looking enhancement.",
    image: "services/medical-spa-hero",
    href: "/services/medical-spa",
    categories: ["Injectables", "Laser", "Skin"]
  },
  {
    title: "Functional Medicine",
    description: "Holistic approaches to optimize your health and wellness.",
    image: "services/functional-medicine-hero",
    href: "/services/functional-medicine",
    categories: ["Hormone", "Nutrition", "Wellness"]
  }
]

export default function Services() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "Advanced Aesthetic Medicine",
            "description": "Comprehensive aesthetic and wellness services including plastic surgery, dermatology, medical spa treatments, and functional medicine.",
            "medicalSpecialty": [
              "Plastic Surgery",
              "Dermatology",
              "Medical Spa",
              "Functional Medicine"
            ],
            "availableService": services.map(service => ({
              "@type": "MedicalProcedure",
              "name": service.title,
              "description": service.description,
              "url": `https://www.alluremd.com${service.href}`
            }))
          })
        }}
      />
      
      <PageHero
        title="Comprehensive Aesthetic Solutions"
        subtitle="Our Services"
        description="Experience the perfect blend of artistry and medical expertise across our range of aesthetic and wellness services."
        image={{
          path: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-services',
          alt: 'Our Services'
        }}
      />

      {/* Services Grid */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <Link 
              key={service.title} 
              href={service.href}
              className="group block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={getCloudinaryUrl(service.image, {
                    width: 800,
                    height: 600,
                    crop: 'fill',
                    gravity: 'auto',
                    quality: 90
                  })}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-serif mb-2">{service.title}</h3>
                  <p className="text-sm text-zinc-300 mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.categories.map((category) => (
                      <span 
                        key={category}
                        className="px-3 py-1 text-xs rounded-full border border-white/30 bg-black/30"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Section>
    </main>
  )
} 