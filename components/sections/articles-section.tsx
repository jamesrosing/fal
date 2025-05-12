"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LearnMoreButton } from "../ui/learn-more-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Article } from "@/lib/types"
import CldImage from "@/components/media/CldImage"
import { useIsMobile } from "@/hooks/use-mobile"

export function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Use direct Cloudinary public ID
  const backgroundPublicId = "homepage-articles-background";

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await fetch('/api/articles/featured?limit=3');
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, []);

  // Mobile Layout: Image on top, text below
  if (isMobile) {
    return (
      <section className="bg-black text-white">
        {/* Media container with preserved aspect ratio */}
        <div className="relative w-full aspect-[16/9]">
          <CldImage 
            publicId={backgroundPublicId} 
            alt="Allure MD Articles" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="w-full h-full object-cover"
            sizes="100vw"
            crop="fill"
            priority
            showLoading={true}
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
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Articles</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Insights and education from our experts
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
              <p>
                Explore our collection of articles covering the latest advancements in aesthetic medicine,
                skincare tips, treatment options, and more. Our experts regularly share their knowledge to help
                you make informed decisions about your health and beauty journey.
              </p>
            </div>
            <div className="mt-8">
              <LearnMoreButton href="/articles">Explore Our Articles</LearnMoreButton>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Desktop Layout
  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0">
        <CldImage
          publicId={backgroundPublicId}
          alt="Allure MD Articles"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          sizes="100vw"
          crop="fill"
          priority
          showLoading={true}
        />
        {/* Dark gradient overlay that fades from right to left for text on the right */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 py-32 lg:px-8 lg:py-48 min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="ml-auto max-w-2xl text-right"
        >
          <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Articles</h2>
          <h3 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight font-serif text-white mb-8">
            Insights and education from our experts
          </h3>
          <div className="space-y-6 text-base font-cerebri font-light text-gray-200">
            <p>
              Explore our collection of articles covering the latest advancements in aesthetic medicine,
              skincare tips, treatment options, and more. Our experts regularly share their knowledge to help
              you make informed decisions about your health and beauty journey.
            </p>
          </div>
          <div className="mt-10">
            <LearnMoreButton href="/articles">Explore Our Articles</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 