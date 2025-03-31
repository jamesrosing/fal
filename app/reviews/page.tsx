"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Star } from "lucide-react"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const reviews = [
  {
    name: "Sarah M.",
    service: "Functional Medicine",
    image: "/images/reviews/review-1.jpg",
    rating: 5,
    text: "The functional medicine approach at Allure MD completely transformed my health journey. Their comprehensive analysis and personalized treatment plan addressed root causes I never knew existed.",
    date: "March 2024"
  },
  {
    name: "Michael R.",
    service: "Medical Spa",
    image: "/images/reviews/review-2.jpg",
    rating: 5,
    text: "The medical spa services are exceptional. The staff's attention to detail and expertise in advanced treatments have given me amazing results. I couldn't be happier!",
    date: "February 2024"
  },
  {
    name: "Jennifer L.",
    service: "Dermatology",
    image: "/images/reviews/review-3.jpg",
    rating: 5,
    text: "Susan Pearose is incredible! Her expertise in dermatology and patient-centered approach made me feel confident and comfortable throughout my treatment journey.",
    date: "January 2024"
  }
]

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <OptimizedImage id="hero/reviews-hero.jpg" alt="Patient Reviews"   priority fill />
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
                Reviews
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Patient Success Stories
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Discover the experiences of our patients and their transformative journeys at Allure MD. 
                  Read their stories and learn about the exceptional care and results they've achieved.
                </p>
                <p>We&apos;re proud of our patients&apos; results and their stories.</p>
                <p>Read what our patients have to say about their experiences.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-zinc-900 p-6 rounded-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={review.image}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-white">{review.name}</h3>
                    <p className="text-sm text-zinc-400">{review.service}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-4 font-cerebri font-light">
                  "{review.text}"
                </p>
                <p className="text-sm text-zinc-500">{review.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Write Review CTA */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
              Share Your Experience
            </h2>
            <p className="text-lg text-zinc-300 mb-8 font-cerebri font-light">
              We value your feedback and would love to hear about your experience at Allure MD.
              Your story can help others on their journey to optimal health and wellness.
            </p>
            <a
              href="https://g.page/r/CQ3YXqGM1PQUEAI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-white text-black hover:bg-zinc-200 transition-colors duration-300"
            >
              Write a Review
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 