"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import CldImage from '@/components/media/CldImage'
import { LearnMoreButton } from "../ui/learn-more-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Article } from "@/lib/types"
import { ArticleCard } from "../articles/ArticleCard"

export default function ArticlesSection() {
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<Article[]>([])
  const [isMobile, setIsMobile] = useState(false)
  
  // Default background image public ID - update with your actual image
  const backgroundPublicId = "allure-md/articles/background" 

  // Check for mobile screen size
  useEffect(() => {
    // Function to check if screen is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkIsMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

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
            src={backgroundPublicId} 
            alt="Allure MD Articles" 
            width={1080}
            height={607} // 16:9 aspect ratio
            className="w-full h-full object-cover"
            sizes="100vw"
            crop="fill"
            priority
            config={{
              cloud: {
                cloudName: 'dyrzyfg3w'
              }
            }}
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
    <section className="bg-black text-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Centered Text Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-300 mb-5">Articles</h2>
            <h3 className="text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight font-serif text-white mb-8">
              Insights and education from our experts
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light text-gray-200 max-w-xl mx-auto">
              <p>
                Explore our collection of articles covering the latest advancements in aesthetic medicine,
                skincare tips, treatment options, and more. Our experts regularly share their knowledge to help
                you make informed decisions about your health and beauty journey.
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Article Cards - 3 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col h-full">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            // Actual article cards
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <LearnMoreButton href="/articles">View All Articles</LearnMoreButton>
        </div>
      </div>
    </section>
  );
} 