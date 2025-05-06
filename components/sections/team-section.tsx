"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import UnifiedMedia from '@/components/media/UnifiedMedia'
import CldImage from '@/components/media/CldImage'
import { useState, useEffect } from 'react'

type TeamMember = {
  placeholderId: string;
  alt: string;
  name: string;
  title: string;
  publicId?: string;
};

export function TeamSection() {
  const isMobile = useIsMobile();
  
  // Define team members with placeholderIds
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      placeholderId: "team-provider-rosing",
      alt: "Dr. James Rosing",
      name: "Dr. James Rosing",
      title: "Plastic Surgeon"
    },
    {
      placeholderId: "team-provider-pearose",
      alt: "Susan Pearose, Dermatology Specialist",
      name: "Susan Pearose",
      title: "Dermatology Specialist"
    },
    {
      placeholderId: "team-provider-julia",
      alt: "Julia, Medical Esthetician",
      name: "Julia",
      title: "Medical Esthetician"
    },
    {
      placeholderId: "team-provider-gidwani",
      alt: "Dr. Pooja Gidwani",
      name: "Dr. Pooja Gidwani",
      title: "Functional Medicine"
    }
  ]);
  
  // Background image
  const [backgroundPublicId, setBackgroundPublicId] = useState<string | null>(null);
  
  // Fetch public IDs for team member images and background
  useEffect(() => {
    async function fetchPublicIds() {
      try {
        // Fetch public ID for background image
        const bgResponse = await fetch(`/api/media/homepage-team-background`);
        if (bgResponse.ok) {
          const bgData = await bgResponse.json();
          setBackgroundPublicId(bgData.public_id || bgData.publicId);
        }
        
        // Fetch public IDs for team member images
        const updatedMembers = [...teamMembers];
        let hasChanges = false;
        
        for (let i = 0; i < updatedMembers.length; i++) {
          const member = updatedMembers[i];
          try {
            const response = await fetch(`/api/media/${member.placeholderId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.public_id || data.publicId) {
                updatedMembers[i] = {
                  ...member,
                  publicId: data.public_id || data.publicId
                };
                hasChanges = true;
              }
            }
          } catch (error) {
            console.error(`Error fetching public ID for ${member.placeholderId}:`, error);
          }
        }
        
        if (hasChanges) {
          setTeamMembers(updatedMembers);
        }
      } catch (error) {
        console.error("Error fetching public IDs:", error);
      }
    }
    
    fetchPublicIds();
  }, []);

  // Mobile Layout
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          {backgroundPublicId ? (
            <CldImage 
              publicId={backgroundPublicId}
              alt="Our Medical Team"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover"
              sizes="100vw"
              priority
              quality="auto"
            />
          ) : (
            <UnifiedMedia 
              placeholderId="homepage-team-background"
              alt="Our Medical Team"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover"
              sizes="100vw"
              priority
              mediaType="auto"
              options={{
                width: 1920,
                quality: 80
              }}
              fallbackSrc="/images/global/placeholder-hero.jpg"
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
          {teamMembers.map((member, index) => (
            <div key={index} className="relative py-4">
              <div className="relative aspect-[3/4] overflow-hidden">
                {member.publicId ? (
                  <CldImage
                    publicId={member.publicId}
                    alt={member.alt}
                    width={300}
                    height={400}
                    className="absolute inset-0 w-full h-full object-cover"
                    sizes="50vw"
                    crop="fill"
                    gravity="face"
                    quality="auto"
                  />
                ) : (
                  <UnifiedMedia
                    placeholderId={member.placeholderId}
                    alt={member.alt}
                    width={300}
                    height={400}
                    className="absolute inset-0 w-full h-full object-cover"
                    sizes="50vw"
                    options={{
                      crop: 'fill',
                      gravity: 'face',
                      quality: 90
                    }}
                    fallbackSrc="/images/global/placeholder-team.jpg"
                  />
                )}
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
    <section className="bg-black text-white">
      {/* Content section with text and team grid */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row w-full gap-12">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-md"
            >
              <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Our Team</h2>
              <h3 className="text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif mb-8">
                Expert care from trusted professionals
              </h3>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                  decades of combined experience in aesthetic medicine.
                </p>
                <p>
                  We are committed to delivering exceptional results while ensuring your comfort and safety throughout every
                  procedure and treatment.
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
            
            {/* Right side - Team images grid in 2x2 layout */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden group">
                    {member.publicId ? (
                      <CldImage
                        publicId={member.publicId}
                        alt={member.alt}
                        width={300}
                        height={400}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        crop="fill"
                        gravity="face"
                        quality="auto"
                      />
                    ) : (
                      <UnifiedMedia
                        placeholderId={member.placeholderId}
                        alt={member.alt}
                        width={300}
                        height={400}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        options={{
                          crop: 'fill',
                          gravity: 'face',
                          quality: 90
                        }}
                        fallbackSrc="/images/global/placeholder-team.jpg"
                      />
                    )}
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:opacity-60 transition-opacity" />
                    
                    {/* Provider name and title */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform transition-transform duration-300 group-hover:translate-y-0">
                      <h4 className="text-md lg:text-lg font-cerebri font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-300">{member.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-width background image with parallax effect */}
      <div className="relative h-[40vh]">
        {backgroundPublicId ? (
          <CldImage
            publicId={backgroundPublicId}
            alt="Team at Allure MD"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-center"
            priority
            sizes="100vw"
            quality="auto"
          />
        ) : (
          <UnifiedMedia
            placeholderId="homepage-team-background"
            alt="Team at Allure MD"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-center"
            priority
            sizes="100vw"
            options={{
              width: 1920,
              quality: 80
            }}
            fallbackSrc="/images/global/placeholder-hero.jpg"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Overlay call to action */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white px-4"
          >
            <h3 className="text-3xl md:text-4xl font-serif mb-4">Your journey to confidence begins here</h3>
            <LearnMoreButton href="/appointment">
              Schedule Your Consultation
            </LearnMoreButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

