"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { AppointmentScheduler } from "@/components/scheduling/AppointmentScheduler"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


function LoadingScheduler() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
      <p className="text-zinc-400">Loading scheduler...</p>
    </div>
  )
}

export default function AppointmentPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] lg:h-[50vh]">
        <div className="absolute inset-0">
          <CldImage publicId="hero/appointment-hero.jpg" alt="Schedule an Appointment"   priority fill / config={{
          cloud: {
            cloudName: 'dyrzyfg3w'
          }
        }}>
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
                Schedule an Appointment
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Begin your transformation journey
              </h2>
              <p className="text-lg font-cerebri font-light">
                Take the first step towards achieving your aesthetic goals. Our expert team is ready to guide you through your personalized treatment plan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scheduler Section */}
      <section className="py-16 lg:py-24 bg-black">
        <div className="container mx-auto px-4">
          <Suspense fallback={<LoadingScheduler />}>
            <AppointmentScheduler />
          </Suspense>
                  </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 lg:py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-6 text-white">
              <h3 className="text-3xl font-serif">What to Expect</h3>
              <p className="text-lg font-cerebri font-light">
                During your consultation, our expert team will:
              </p>
              <ul className="text-lg font-cerebri font-light space-y-4">
                <li className="flex items-center justify-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Listen to your goals and concerns</span>
                </li>
                <li className="flex items-center justify-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Perform a thorough evaluation</span>
                </li>
                <li className="flex items-center justify-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Discuss treatment options</span>
                </li>
                <li className="flex items-center justify-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Create a personalized treatment plan</span>
                </li>
                <li className="flex items-center justify-center space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Answer all your questions</span>
                </li>
              </ul>
              </div>

            <div className="text-sm text-zinc-400">
              <p>
                By scheduling an appointment, you agree to our{" "}
                <a href="/terms" className="text-white underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                <a href="/privacy" className="text-white underline hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </p>
              <p className="mt-4">
                  For immediate assistance, please call us at{" "}
                <a href="tel:9497067874" className="text-white hover:text-primary">
                    (949) 706-7874
                  </a>
                </p>
              </div>
          </div>
        </div>
      </section>
    </main>
  )
} 