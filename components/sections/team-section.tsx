"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useIsMobile } from "@/hooks/use-mobile"
import { CldImage } from 'next-cloudinary'
import { useState, useEffect } from 'react'
import Image from 'next/image'

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
              src={backgroundPublicId}
              alt="Our Medical Team"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover"
              sizes="100vw"
              priority
              quality="auto"
            />
          ) : (
            <Image 
              src="/images/global/placeholder-hero.jpg"
              alt="Our Medical Team"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover"
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
          {teamMembers.map((member, index) => (
            <div key={index} className="relative py-4">
              <div className="relative aspect-[3/4] overflow-hidden">
                {member.publicId ? (
                  <CldImage
                    src={member.publicId}
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
                  <Image
                    src="/images/global/placeholder-team.jpg"
                    alt={member.alt}
                    width={300}
                    height={400}
                    className="absolute inset-0 w-full h-full object-cover"
                    sizes="50vw"
                  />
                )}
                {/* Overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Name and title at bottom */}
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <h4 className="text-lg font-serif text-white mb-0">{member.name}</h4>
                  <p className="text-sm font-cerebri text-gray-200">{member.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Desktop layout - Full width layout with image on the right and text on the left
  return (
    <section className="bg-black text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Content */}
        <div className="lg:w-1/2 px-4 py-12 lg:p-24 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Our Team</h2>
            <h3 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Expert care from trusted professionals
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our team of board-certified physicians, licensed medical professionals, and skilled aestheticians brings
                decades of combined experience in aesthetic medicine.
              </p>
              <p>
                We are committed to delivering exceptional results while ensuring your comfort and safety. Each team member
                is dedicated to helping you achieve your aesthetic goals and enhancing your natural beauty.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Our Team</LearnMoreButton>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Team portrait grid */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-0.5">
          {teamMembers.map((member, index) => (
            <div key={index} className="relative aspect-square overflow-hidden">
              {member.publicId ? (
                <CldImage
                  src={member.publicId}
                  alt={member.alt}
                  width={600}
                  height={600}
                  className="absolute inset-0 w-full h-full object-cover"
                  sizes="50vw"
                  crop="fill"
                  gravity="face"
                  quality="auto"
                />
              ) : (
                <Image
                  src="/images/global/placeholder-team.jpg"
                  alt={member.alt}
                  width={600}
                  height={600}
                  className="absolute inset-0 w-full h-full object-cover"
                  sizes="50vw"
                />
              )}
              
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              
              {/* Name and title */}
              <div className="absolute bottom-0 left-0 w-full p-4">
                <h4 className="text-xl font-serif text-white mb-0.5">{member.name}</h4>
                <p className="text-sm font-cerebri text-gray-200">{member.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Full-width background image section as visual separator */}
      <div className="h-64 lg:h-96 w-full relative">
        {backgroundPublicId ? (
          <CldImage 
            src={backgroundPublicId}
            alt="Our Medical Team"
            width={1920}
            height={600}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
            crop="fill"
            gravity="auto"
            quality="auto"
          />
        ) : (
          <Image 
            src="/images/global/placeholder-hero.jpg"
            alt="Our Medical Team"
            width={1920}
            height={600}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </section>
  );
}

