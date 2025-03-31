"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { useMediaAsset, MediaHookResult } from '@/hooks/useMedia'
import { useIsMobile } from "@/hooks/use-mobile"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


// Define types for better type safety
type Value = {
  title: string;
  description: string;
  mediaKey: string;
}

type Facility = {
  title: string;
  description: string;
  mediaKey: string;
}

// Define types for our media hook records
type ValueMediaHooks = {
  [key: string]: MediaHookResult;
}

type FacilityMediaHooks = {
  [key: string]: MediaHookResult;
}

// Use media keys instead of hardcoded URLs
const values: Value[] = [
  {
    title: "Excellence",
    description: "Commitment to the highest standards of medical care and aesthetic results.",
    mediaKey: "about-values-excellence-icon"
  },
  {
    title: "Innovation",
    description: "Utilizing the latest technologies and techniques in aesthetic medicine.",
    mediaKey: "about-values-innovation-icon"
  },
  {
    title: "Safety",
    description: "Prioritizing patient safety and well-being in every procedure.",
    mediaKey: "about-values-safety-icon"
  },
  {
    title: "Personalization",
    description: "Tailoring treatments to each patient's unique goals and anatomy.",
    mediaKey: "about-values-personalization-icon"
  }
]

const facilities: Facility[] = [
  {
    title: "State-of-the-Art Operating Rooms",
    description: "Fully accredited surgical facilities with advanced equipment",
    mediaKey: "about-facilities-operating-room"
  },
  {
    title: "Luxury Recovery Suites",
    description: "Private, comfortable spaces for post-procedure recovery",
    mediaKey: "about-facilities-recovery-suite"
  },
  {
    title: "Advanced Treatment Rooms",
    description: "Specialized spaces for non-surgical procedures and treatments",
    mediaKey: "about-facilities-treatment-room"
  }
]

export default function AboutPage() {
  const isMobile = useIsMobile();
  
  // Hero section media
  const { url: heroUrl, isVideo: isHeroVideo, isLoading: isHeroLoading } = useMediaAsset('about-hero-background', {
    width: 1920,
    quality: 90,
    format: 'auto',
    responsive: true
  });

  // Values icons - call hooks at component level
  const valueMediaHooks: ValueMediaHooks = {
    "about-values-excellence-icon": useMediaAsset('about-values-excellence-icon', { width: 160, quality: 90 }),
    "about-values-innovation-icon": useMediaAsset('about-values-innovation-icon', { width: 160, quality: 90 }),
    "about-values-safety-icon": useMediaAsset('about-values-safety-icon', { width: 160, quality: 90 }),
    "about-values-personalization-icon": useMediaAsset('about-values-personalization-icon', { width: 160, quality: 90 })
  };
  
  // Facilities images - call hooks at component level
  const facilityMediaHooks: FacilityMediaHooks = {
    "about-facilities-operating-room": useMediaAsset('about-facilities-operating-room', { width: 800, quality: 90, format: 'auto' }),
    "about-facilities-recovery-suite": useMediaAsset('about-facilities-recovery-suite', { width: 800, quality: 90, format: 'auto' }),
    "about-facilities-treatment-room": useMediaAsset('about-facilities-treatment-room', { width: 800, quality: 90, format: 'auto' })
  };

  // Check if any values are still loading
  const isValuesLoading = Object.values(valueMediaHooks).some(hook => hook.isLoading);
  
  // Check if any facilities are still loading
  const isFacilitiesLoading = Object.values(facilityMediaHooks).some(hook => hook.isLoading);

  // Combined loading state
  const isLoading = isHeroLoading || isValuesLoading || isFacilitiesLoading;

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <NavBar />
        <section className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative aspect-[16/9] w-full">
          {heroUrl && (
            <>
              {isHeroVideo ? (
                <video
                  src={heroUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={heroUrl}
                  alt="About Allure MD"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              )}
            </>
          )}
          {!heroUrl && (
            <div className="w-full h-full bg-zinc-900 animate-pulse"></div>
          )}
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

      {/* Values Section - Reimagined */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white mb-20"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-300">
              Our Values
            </h2>
            <h3 className="text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              What drives us forward
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                className="relative group"
              >
                {/* Glowing border on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/20 to-zinc-900/20 rounded-xl -z-10 
                                group-hover:from-zinc-700/40 group-hover:to-zinc-800/40 transition-all duration-300"></div>
                
                <div className="p-8 rounded-xl text-center h-full flex flex-col">
                  {/* Icon container with subtle animation */}
                  <motion.div 
                    className="mb-8 h-24 flex items-center justify-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    {valueMediaHooks[value.mediaKey]?.url && (
                      <Image
                        src={valueMediaHooks[value.mediaKey].url as string}
                        alt={value.title}
                        width={70}
                        height={70}
                        className="mx-auto object-contain filter brightness-110"
                      />
                    )}
                    {!valueMediaHooks[value.mediaKey]?.url && (
                      <div className="w-16 h-16 animate-pulse bg-zinc-800 rounded-full"></div>
                    )}
                  </motion.div>
                  
                  {/* Title with highlight on hover */}
                  <h4 className="text-2xl font-serif mb-5 text-white group-hover:text-white/90 transition-colors">
                    {value.title}
                  </h4>
                  
                  {/* Subtle line separator */}
                  <motion.div 
                    className="w-10 h-0.5 bg-zinc-700 group-hover:bg-zinc-600 mx-auto mb-5"
                    initial={{ width: 0 }}
                    whileInView={{ width: 40 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.8 }}
                    viewport={{ once: true }}
                  ></motion.div>
                  
                  {/* Description with better readability */}
                  <p className="text-zinc-400 font-cerebri font-light group-hover:text-zinc-300 transition-colors">
                    {value.description}
                  </p>
                </div>
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
                  {facilityMediaHooks[facility.mediaKey]?.url && (
                    <Image
                      src={facilityMediaHooks[facility.mediaKey].url as string}
                      alt={facility.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                  {!facilityMediaHooks[facility.mediaKey]?.url && (
                    <div className="w-full h-full animate-pulse bg-zinc-800 rounded-lg"></div>
                  )}
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