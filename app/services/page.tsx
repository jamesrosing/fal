import Link from "next/link"
import Image from "next/image"
import { getCloudinaryUrl } from "@/lib/cloudinary"

// Simple metadata for now
export const metadata = {
  title: 'Our Services',
  description: 'Discover our comprehensive range of aesthetic services including plastic surgery, dermatology, medical spa treatments, and functional medicine.',
}

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
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-center mb-8">Our Services</h1>
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
          Experience the perfect blend of artistry and medical expertise across our range of aesthetic and wellness services.
        </p>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <Link 
              key={service.title} 
              href={service.href}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <div className="w-full h-full relative">
                  <Image
                    src={getCloudinaryUrl(service.image)}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
} 