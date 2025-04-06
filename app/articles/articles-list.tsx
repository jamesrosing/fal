"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Article, ArticleCategory, ARTICLE_CATEGORIES } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


// Define the main category slugs we want to show in the menubar
const MAIN_CATEGORY_SLUGS = ['latest-news', 'plastic-surgery', 'dermatology', 'medical-spa', 'functional-medicine', 'educational'];

interface ArticlesListProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export function ArticlesList({ searchParams }: ArticlesListProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesResponse = await fetch('/api/articles/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Determine the active category from search params
        const categorySlug = (await searchParams).category as string | undefined;
        const subcategorySlug = (await searchParams).subcategory as string | undefined;

        if (categorySlug && categorySlug !== 'all') {
          setActiveCategory(categorySlug);

          // Find subcategories based on active category
          const mainCategoryDef = ARTICLE_CATEGORIES.find(c => c.id === categorySlug);
          if (mainCategoryDef) {
            // Get available subcategories for this category from the database
            const subcategoriesResponse = await fetch(`/api/articles/subcategories?category=${categorySlug}`);
            
            if (subcategoriesResponse.ok) {
              const subcategoriesData = await subcategoriesResponse.json();
              setSubcategories(subcategoriesData);
            } else {
              // Fallback to static subcategories if API fails
              setSubcategories([]);
            }
          }

          if (subcategorySlug && subcategorySlug !== 'all') {
            setActiveSubcategory(subcategorySlug);
          } else {
            setActiveSubcategory('all');
          }
        } else {
          setActiveCategory('all');
          setActiveSubcategory('all');
          setSubcategories([]);
        }
        
        // Fetch articles with optional category filter
        let apiUrl = '/api/articles';
        const queryParams = [];
        
        if (categorySlug && categorySlug !== 'all') {
          const categoryId = categoriesData.find((c: any) => c.slug === categorySlug)?.id;
          if (categoryId) {
            queryParams.push(`category=${categoryId}`);
          }
          
          if (subcategorySlug && subcategorySlug !== 'all') {
            queryParams.push(`subcategory=${subcategorySlug}`);
          }
        }
        
        if (queryParams.length > 0) {
          apiUrl += `?${queryParams.join('&')}`;
        }
        
        const articlesResponse = await fetch(apiUrl);
        if (!articlesResponse.ok) throw new Error('Failed to fetch articles');
        const articlesData = await articlesResponse.json();
        
        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [searchParams]);
  
  // Get main categories for menubar
  const mainCategories = [
    { id: 'all', slug: 'all', name: 'All Articles' },
    ...categories.filter((cat: any) => MAIN_CATEGORY_SLUGS.includes(cat.slug))
  ];

  // Handle subcategory change
  const handleSubcategoryChange = (value: string) => {
    if (value === 'all') {
      router.push(`/articles?category=${activeCategory}`);
    } else {
      router.push(`/articles?category=${activeCategory}&subcategory=${value}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        {/* Category Skeleton */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        
        {/* Subcategory Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
        </div>
        
        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Category Menubar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {mainCategories.map((cat) => (
          <Link 
            key={cat.id} 
            href={cat.slug === 'all' ? '/articles' : `/articles?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.slug 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
      
      {/* Subcategory Select Dropdown (only shown when a main category is selected) */}
      {activeCategory !== 'all' && subcategories.length > 0 && (
        <div className="mb-8 w-full max-w-xs">
          <Select 
            value={activeSubcategory} 
            onValueChange={handleSubcategoryChange}
          >
            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Filter by subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((subcat: any) => (
                <SelectItem key={subcat.slug} value={subcat.slug}>
                  {subcat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => {
          // Handle full URLs or just public IDs
          const imageUrl = article.featured_image || article.image;
          const formattedImageUrl = imageUrl?.includes('https://') 
            ? imageUrl 
            : `https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/${imageUrl}`;
          
          const publishDate = article.publishedAt || article.date || article.createdAt;
          const categoryName = article.categoryName || 
            categories.find((c: any) => c.id === article.category_id)?.name || 
            categories.find((c: any) => c.slug === article.category)?.name || 
            'Uncategorized';
          
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
                    src={formattedImageUrl || "/placeholder-image.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-2 py-1 mb-2 text-xs font-medium bg-white/20 backdrop-blur-md rounded-full text-white">
                      {categoryName}
                    </span>
                    <h3 className="text-lg font-serif text-white">{article.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex items-center text-xs text-zinc-400">
                      <span>{new Date(publishDate || new Date()).toLocaleDateString()}</span>
                      <span className="mx-1.5">•</span>
                      <span>{article.readTime || article.reading_time ? `${article.readTime || article.reading_time} min` : '5 min read'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {articles.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">No articles found</h3>
          <p className="text-zinc-400">Try selecting a different category or check back later.</p>
        </div>
      )}
    </div>
  );
} 