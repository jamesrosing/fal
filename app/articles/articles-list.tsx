"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Article, ArticleCategory } from '@/lib/types';
import { articles, ARTICLE_CATEGORIES } from '@/lib/articles';

interface ArticlesListProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ArticlesList({ searchParams }: ArticlesListProps) {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'all'>('all');
  
  useEffect(() => {
    // Initialize with all articles
    setFilteredArticles(articles);
    
    // Filter articles based on search params
    const category = searchParams.category as string | undefined;
    
    if (category && category !== 'all') {
      setActiveCategory(category as ArticleCategory);
      setFilteredArticles(articles.filter(article => article.category === category));
    } else {
      setActiveCategory('all');
      setFilteredArticles(articles);
    }
  }, [searchParams]);
  
  const categories = [
    { id: 'all' as const, label: 'All Articles' },
    ...ARTICLE_CATEGORIES.map(cat => ({ id: cat.id, label: cat.name }))
  ];

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={cat.id === 'all' ? '/articles' : `/articles?category=${cat.id}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article) => {
          // Handle full URLs or just public IDs
          const imageUrl = article.image.includes('https://res.cloudinary.com') 
            ? article.image 
            : `https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/${article.image}`;
          
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group"
            >
              <Link href={`/articles/${article.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-medium bg-white/20 backdrop-blur-md rounded-full text-white">
                      {ARTICLE_CATEGORIES.find(cat => cat.id === article.category)?.name || article.category}
                    </span>
                    <h3 className="text-lg font-serif text-white">{article.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex items-center text-xs text-zinc-400">
                      <span>{article.date}</span>
                      <span className="mx-1.5">•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">No articles found</h3>
          <p className="text-zinc-400">Try selecting a different category or check back later.</p>
        </div>
      )}
    </div>
  );
} 