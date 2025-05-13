"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"
import { useState } from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"

type TabItem = {
  name: string;
  link: string;
};

export function MedicalSpaSection() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Full Cloudinary URL for background image
  const imageUrl = "https://res.cloudinary.com/dyrzyfg3w/image/upload/v1741816764/main-page/sections/medical-spa-section/3R8A0806-Enhanced-NR_pp.jpg";

  // Tab data
  const tabs: TabItem[] = [
    { name: "Facial Treatments", link: "/medical-spa/facial-treatments" },
    { name: "Body Contouring", link: "/medical-spa/body-contouring" },
    { name: "Cosmetic Injections", link: "/medical-spa/cosmetic-injections" }
  ];
  
  // Desktop tab navigation with absolute positioning
  const desktopTabNavigation = (
    <div className="absolute bottom-0 left-0 right-0 flex">
      {tabs.map((tab) => (
        <Link
          href={tab.link}
          key={tab.name}
          className={`flex-1 py-6 text-center text-white border-t border-white/30 backdrop-blur-sm transition-colors duration-300 ${
            activeTab === tab.name ? "bg-white/20" : "bg-transparent hover:bg-white/10"
          }`}
          onMouseEnter={() => setActiveTab(tab.name)}
          onMouseLeave={() => setActiveTab(null)}
        >
          <span className="font-cerebri text-sm uppercase tracking-wider">{tab.name}</span>
        </Link>
      ))}
    </div>
  );
  
  // Mobile tab navigation without absolute positioning - now with extra small text
  const mobileTabNavigation = (
    <div className="flex border-t border-white/30">
      {tabs.map((tab) => (
        <Link
          href={tab.link}
          key={tab.name}
          className={`flex-1 py-3 text-center text-white backdrop-blur-sm transition-colors duration-300 ${
            activeTab === tab.name ? "bg-white/20" : "bg-transparent hover:bg-white/10"
          }`}
          onClick={() => setActiveTab(tab.name)}
        >
          <span className="font-cerebri text-[0.65rem] uppercase tracking-tight">{tab.name}</span>
        </Link>
      ))}
    </div>
  );

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="relative bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <Image 
            src={imageUrl} 
            alt="Medical Spa Services" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="object-cover w-full h-full"
            sizes="100vw"
            priority
          />
          {/* Subtle overlay for readability */}
          <div className="absolute inset-0 bg-black/20" />
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
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Medical Spa</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Rejuvenation treatments for face and body
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Our medical spa combines luxury with clinical excellence. Enjoy targeted treatments like chemical peels,
                microneedling, and advanced facials customized for your unique skin needs, all in a serene, spa-like setting.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <LearnMoreButton href="/team">Meet Our Aestheticians</LearnMoreButton>
              <br />
              <LearnMoreButton href="/medical-spa">Explore Medical Spa Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Tab Navigation (Mobile) - not absolute positioned */}
        {mobileTabNavigation}
      </section>
    );
  }

  // Desktop Layout
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="Medical Spa Services"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Dark gradient overlay that fades from left (where text is) to right (fully transparent) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full lg:max-w-[50%] flex flex-col min-h-[800px] justify-center"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Medical Spa</h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight font-serif">
            Rejuvenation treatments for face and body
          </h3>
          <div className="space-y-6 text-base font-cerebri font-light">
            <p>
              Our medical spa combines luxury with clinical excellence. Enjoy targeted treatments like chemical peels,
              microneedling, and advanced facials customized for your unique skin needs, all in a serene, spa-like setting.
            </p>
            <div className="space-y-4">
              <LearnMoreButton href="/team">Meet Our Aestheticians</LearnMoreButton>
              <br />
              <LearnMoreButton href="/medical-spa">Explore Medical Spa Services</LearnMoreButton>
              <br />
              <LearnMoreButton href="/consultation">Schedule a Consultation</LearnMoreButton>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom Tab Navigation (Desktop) - absolute positioned */}
      {desktopTabNavigation}
    </section>
  )
}

