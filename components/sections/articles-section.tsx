"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LearnMoreButton } from "../ui/learn-more-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Article } from "@/lib/types"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="relative py-24 bg-black text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-300">
            Latest Articles
          </h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
            Stay informed with Allure MD
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden border border-zinc-800 bg-black h-[450px]">
                <div className="relative w-full aspect-[4/3]">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="mt-auto">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            articles.map((article, index) => {
              // Handle full URLs or just public IDs
              const imageUrl = article.featured_image || article.image;
              const formattedImageUrl = imageUrl?.includes('https://') 
                ? imageUrl 
                : `https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/${imageUrl}`;
                
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group relative flex flex-col overflow-hidden border border-zinc-800 bg-black transition-colors duration-300 hover:border-zinc-700"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={formattedImageUrl || "/placeholder-image.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-sm font-cerebri text-zinc-400">
                      {new Date(article.published_at || article.created_at || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <Link href={`/articles/${article.slug}`} className="mt-3 block">
                      <h3 className="text-xl font-serif text-white transition-colors duration-300 group-hover:text-zinc-300">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-base font-cerebri font-light text-zinc-400 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </Link>
                    <div className="mt-6 mt-auto">
                      <LearnMoreButton href={`/articles/${article.slug}`}>
                        Read Article
                      </LearnMoreButton>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="text-center mt-12">
          <LearnMoreButton href="/articles">View All Articles</LearnMoreButton>
        </div>
      </div>
    </section>
  )
} 