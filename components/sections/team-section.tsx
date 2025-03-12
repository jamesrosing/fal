"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"

export function TeamSection() {
  // Use useMediaAsset hook for each team member image
  const { url: drRosingImageUrl } = useMediaAsset('team-provider-rosing', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: drPearoseImageUrl } = useMediaAsset('team-provider-pearose', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: juliaImageUrl } = useMediaAsset('team-staff-julia', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: drGidwaniImageUrl } = useMediaAsset('team-provider-gidwani', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });

  // Define team images with fallback URLs
  const teamImages = [
    {
      src: drRosingImageUrl || "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133485/uncategorized/Dr_James_Rosing_white_bg-5w4lH8VlTQFJUoq0ggd5Y9dFbESMHJ.png",
      alt: "Dr. James Rosing"
    },
    {
      src: drPearoseImageUrl || "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133486/services/dermatology/susan%2520pearose%2520dermatology%2520headshot%25201-Jsjg50FwPodXo3xuTN7sv0WlGo63gL.png",
      alt: "Dr. Susan Pearose"
    },
    {
      src: juliaImageUrl || "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133486/team/headshots/julia%2520medical%2520esthetican%2520headshot-ogGKpiWSQrqW5Z4sv9pf1kiyuctPTJ.png",
      alt: "Julia, Medical Esthetician"
    },
    {
      src: drGidwaniImageUrl || "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741133487/team/headshots/pooja%2520gidwani%2520md%2520functional%2520medince%2520headshot-yNLxeL8rTQtSRlD1g9kR6ZZFgiZoKR.png",
      alt: "Dr. Pooja Gidwani"
    }
  ];

  return (
    <section className="relative min-h-screen bg-black">
      {/* Mobile Layout */}
      <div className="lg:hidden relative">
        {/* Hero Container with 16:9 aspect ratio */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={teamImages[0].src}
            alt={teamImages[0].alt}
            fill
            className="object-fill"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 gap-1">
          {teamImages.slice(1).map((image, index) => (
            <motion.div
              key={index}
              className="relative aspect-[3/4]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-fill"
                sizes="50vw"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                initial={{ opacity: 0.4 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
                viewport={{ once: true }}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile Text Content - Overlaid at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Our Team</h2>
          <h3 className="mb-4 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Expert care from trusted professionals
          </h3>
          <div className="space-y-4 text-lg font-cerebri font-light">
            <p className="line-clamp-3">
              Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
              decades of combined experience in aesthetic medicine.
            </p>
            <div className="flex flex-wrap gap-4">
              <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
              <LearnMoreButton href="/about">Learn About Our Practice</LearnMoreButton>
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex container mx-auto min-h-screen flex-row">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 flex flex-col justify-center px-4 py-24 text-white lg:w-1/2"
        >
          <motion.div className="max-w-3xl">
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Our Team</h2>
            <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
              Expert care from trusted professionals
            </h3>
            <div className="space-y-6 text-lg font-cerebri font-light">
              <p>
                Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                decades of combined experience in aesthetic medicine. We are committed to delivering exceptional results
                while ensuring your comfort and safety.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
                <br />
                <LearnMoreButton href="/about">Learn About Our Practice</LearnMoreButton>
                <br />
                <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Team photos grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-2 gap-1 lg:w-1/2 lg:-mr-[8.33%]"
        >
          {teamImages.map((image, index) => (
            <motion.div
              key={index}
              className="relative h-full"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="25vw"
                priority={index === 0}
              />
              <motion.div
                className="absolute inset-0 bg-black/40"
                initial={{ opacity: 0.4 }}
                whileInView={{ opacity: 0 }}
                transition={{ duration: 1, delay: index * 0.2 }}
                viewport={{ once: true }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

