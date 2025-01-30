"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"

function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener("loadeddata", () => {
        console.log("Video loaded successfully")
        setIsVideoLoaded(true)
      })
      
      video.addEventListener("error", (e) => {
        console.error("Video error:", e)
        setError("Failed to load video")
      })
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", () => setIsVideoLoaded(true))
        video.removeEventListener("error", () => setError(null))
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white">{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`object-cover w-full h-full transition-opacity duration-1000 ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        poster="/video/video-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/background.webm" type="video/webm" />
        <source src="/video/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  )
}

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error)
      })
    }
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden" aria-label="Hero Section">
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          {/* Optional: Add a loading spinner here */}
        </div>
      )}
      <BackgroundVideo />

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

