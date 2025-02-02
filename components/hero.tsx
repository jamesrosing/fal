"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BackgroundVideo } from "@/components/ui/background-video"

// TODO: Replace these URLs with your CDN URLs
// Recommended: Use a CDN service like Cloudinary, Bunny.net, or Amazon S3 + CloudFront
// Example CDN URL structure: https://your-cdn.com/videos/allure-md/hero-720p.webm
const videoSources = [
  {
    src: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1738454119/oehjm5ldprdry2cpisyn.webm",
    type: "video/webm",
    media: "(min-width: 720px)",
  },
  {
    src: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1738454116/fdggfu5mcx2w8qm9ujip.mp4",
    type: "video/mp4",
    media: "(min-width: 720px)",
  },
  {
    src: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1738454110/nsbm1clhxjadxnhjvovg.webm",
    type: "video/webm",
    media: "(max-width: 719px)",
  },
  {
    src: "https://res.cloudinary.com/dyrzyfg3w/video/upload/v1738454102/bsxhfycdxqda3nr5dosg.mp4",
    type: "video/mp4",
    media: "(max-width: 719px)",
  },
]

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      <BackgroundVideo
        poster="/images/hero-poster.jpg"
        fallbackImage="/images/hero-fallback.jpg"
        sources={videoSources}
      />

      <div className="relative h-full flex items-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="hero-text mb-6">Advanced Aesthetic Medicine</h1>
            <p className="hero-tagline text-xl sm:text-2xl mb-8 text-gray-200">Where artistry meets science</p>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-black transition-colors bg-transparent"
            >
              Schedule Consultation
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}

