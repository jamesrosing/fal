"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useMediaAsset } from "@/hooks/useMedia"
import { useIsMobile } from "@/hooks/use-mobile"

type TeamMember = {
  src: string;
  alt: string;
  name: string;
  title: string;
};

export function TeamSection() {
  const isMobile = useIsMobile();
  
  // Use useMediaAsset hook for each team member image
  const { url: drRosingImageUrl, isLoading: isLoadingRosing } = useMediaAsset('team-provider-rosing', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: drPearoseImageUrl, isLoading: isLoadingPearose } = useMediaAsset('team-provider-pearose', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: juliaImageUrl, isLoading: isLoadingJulia } = useMediaAsset('team-provider-julia', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });
  
  const { url: drGidwaniImageUrl, isLoading: isLoadingGidwani } = useMediaAsset('team-provider-gidwani', {
    width: 600,
    height: 800,
    crop: 'fill',
    gravity: 'face',
    quality: 90
  });

  // Get a background image for the team section
  const { url: teamBackgroundUrl, isVideo, isLoading: isLoadingBackground } = useMediaAsset('homepage-team-background', {
    width: 1920,
    quality: 80,
    format: 'auto',
    responsive: true
  });

  // Check if any images are still loading
  const isLoading = isLoadingRosing || isLoadingPearose || isLoadingJulia || isLoadingGidwani || isLoadingBackground;

  // Define team images
  const teamImages: TeamMember[] = [
    {
      src: drRosingImageUrl || "",
      alt: "Dr. James Rosing",
      name: "Dr. James Rosing",
      title: "Plastic Surgeon"
    },
    {
      src: drPearoseImageUrl || "",
      alt: "Susan Pearose, Dermatology Specialist",
      name: "Susan Pearose",
      title: "Dermatology Specialist"
    },
    {
      src: juliaImageUrl || "",
      alt: "Julia, Medical Esthetician",
      name: "Julia",
      title: "Medical Esthetician"
    },
    {
      src: drGidwaniImageUrl || "",
      alt: "Dr. Pooja Gidwani",
      name: "Dr. Pooja Gidwani",
      title: "Functional Medicine"
    }
  ];

  // Display loading placeholder if media is still loading
  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading team profiles...</div>
        </div>
      </section>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          {isVideo ? (
            <video
              src={teamBackgroundUrl || drRosingImageUrl || ""}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image 
              src={teamBackgroundUrl || drRosingImageUrl || ""} 
              alt="Our Medical Team" 
              fill 
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Text content below image */}
        <div className="px-4 py-12 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto"
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Our Team</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Expert care from trusted professionals
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                decades of combined experience in aesthetic medicine. We are committed to delivering exceptional results
                while ensuring your comfort and safety.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
              <br />
              <LearnMoreButton href="/about">Learn About Our Practice</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </motion.div>
        </div>
        
        {/* Team Grid - 2x2 with 3:4 aspect ratio */}
        <div className="grid grid-cols-2 gap-1 bg-black py-8">
          {teamImages.map((member, index) => (
            <div key={index} className="relative py-4">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={member.src}
                  alt={member.alt}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                {/* Overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Provider name and title */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h4 className="text-sm font-cerebri font-medium">{member.name}</h4>
                  <p className="text-xs text-gray-300">{member.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Desktop Layout
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            src={teamBackgroundUrl || ""}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <Image 
            src={teamBackgroundUrl || ""} 
            alt="Our Medical Team" 
            fill 
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 py-24 min-h-screen flex items-center">
        <div className="flex flex-col lg:flex-row w-full gap-12">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center text-white lg:w-1/2"
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
            className="relative grid grid-cols-2 gap-4 py-8 lg:w-1/2"
          >
            {teamImages.map((image, index) => (
              <motion.div
                key={index}
                className="relative h-full py-4"
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
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-sm font-cerebri font-medium text-white">{image.name}</h4>
                  <p className="text-xs text-gray-300">{image.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

