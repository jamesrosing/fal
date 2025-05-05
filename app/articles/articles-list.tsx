"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Article, ArticleCategory, ARTICLE_CATEGORIES } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import CloudinaryFolderImage from '@/components/media/CloudinaryFolderImage';
import { extractImageNameFromPath, isCloudinaryUrl } from '@/lib/cloudinary/folder-utils';

// Define the main category slugs we want to show in the menubar
const MAIN_CATEGORY_SLUGS = ['latest-news', 'plastic-surgery', 'dermatology', 'medical-spa', 'functional-medicine', 'educational'];

// Fallback categories in case API fails
const FALLBACK_CATEGORIES = [
  { id: 'latest-news', slug: 'latest-news', name: 'Latest News' },
  { id: 'plastic-surgery', slug: 'plastic-surgery', name: 'Plastic Surgery' },
  { id: 'dermatology', slug: 'dermatology', name: 'Dermatology' },
  { id: 'medical-spa', slug: 'medical-spa', name: 'Medical Spa' },
  { id: 'functional-medicine', slug: 'functional-medicine', name: 'Functional Medicine' },
  { id: 'educational', slug: 'educational', name: 'Educational' }
];

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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories first
        let categoriesData = [];
        try {
          const categoriesResponse = await fetch('/api/articles/categories');
          if (!categoriesResponse.ok) {
            throw new Error('Failed to fetch categories');
          }
          categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          // Fall back to predefined categories
          console.log('Using fallback categories');
          categoriesData = FALLBACK_CATEGORIES;
          setCategories(FALLBACK_CATEGORIES);
        }
        
        // Determine the active category from search params
        const categorySlug = (await searchParams).category as string | undefined;
        const subcategorySlug = (await searchParams).subcategory as string | undefined;

        if (categorySlug && categorySlug !== 'all') {
          setActiveCategory(categorySlug);

          // Find subcategories based on active category
          try {
            // Get available subcategories for this category from the database
            const subcategoriesResponse = await fetch(`/api/articles/subcategories?category=${categorySlug}`);
            
            if (subcategoriesResponse.ok) {
              const subcategoriesData = await subcategoriesResponse.json();
              setSubcategories(subcategoriesData);
            } else {
              // Fallback to empty subcategories if API fails
              setSubcategories([]);
            }
          } catch (subcatError) {
            console.error('Error fetching subcategories:', subcatError);
            setSubcategories([]);
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
        try {
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
        } catch (articlesError) {
          console.error('Error fetching articles:', articlesError);
          setArticles([]);
          setError('Could not load articles. Please try again later.');
        }
      } catch (error) {
        console.error('Error in main fetchData function:', error);
        setError('An error occurred while loading content.');
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
          const imageIsCloudinaryUrl = article.featured_image && isCloudinaryUrl(article.featured_image);
          const articleImageFolder = 'articles';
          const articleImageName = article.featured_image ? 
            (imageIsCloudinaryUrl ? extractImageNameFromPath(article.featured_image) : article.featured_image) : 
            null;
          
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
                  {articleImageName ? (
                    <CloudinaryFolderImage
                      folder={articleImageFolder}
                      imageName={articleImageName}
                      alt={article.title}
                      width={600}
                      height={450}
                      crop="fill"
                      gravity="auto"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-400 mb-2">{categoryName}</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-300 transition-colors">{article.title}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2">{article.excerpt}</p>
                  
                  <div className="flex items-center mt-3 text-sm text-zinc-500">
                    <span className="mr-2">
                      {publishDate && new Date(publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {article.readTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{article.readTime}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
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