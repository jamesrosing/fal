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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

// Define the main category slugs we want to show in the menubar
// Ensure no duplicates are present in this list
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
  const [tags, setTags] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
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
          
          // Ensure no duplicate categories by using a Map with slug as key
          const uniqueCategoriesMap = new Map();
          categoriesData.forEach((category: any) => {
            if (!uniqueCategoriesMap.has(category.slug)) {
              uniqueCategoriesMap.set(category.slug, category);
            }
          });
          
          // Convert back to array
          const uniqueCategories = Array.from(uniqueCategoriesMap.values());
          setCategories(uniqueCategories);
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
        const tagParam = (await searchParams).tag as string | undefined;
        const searchParam = (await searchParams).search as string | undefined;
        
        // Set search query from URL params if present
        if (searchParam) {
          setSearchQuery(searchParam);
        }
        
        // Set active tags from URL params if present
        if (tagParam) {
          setActiveTags(Array.isArray(tagParam) ? tagParam : [tagParam]);
        }

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
          
          // Add tag filter if present
          if (tagParam) {
            const tagsToFilter = Array.isArray(tagParam) ? tagParam : [tagParam];
            tagsToFilter.forEach(tag => {
              queryParams.push(`tag=${encodeURIComponent(tag)}`);
            });
          }
          
          // Add search query if present
          if (searchParam) {
            queryParams.push(`search=${encodeURIComponent(searchParam)}`);
          }
          
          if (queryParams.length > 0) {
            apiUrl += `?${queryParams.join('&')}`;
          }
          
          const articlesResponse = await fetch(apiUrl);
          if (!articlesResponse.ok) throw new Error('Failed to fetch articles');
          const articlesData = await articlesResponse.json();
          
          setArticles(articlesData);
          
          // Extract unique tags from articles
          const allTags = new Set<string>();
          articlesData.forEach((article: Article) => {
            if (article.tags && Array.isArray(article.tags)) {
              article.tags.forEach(tag => allTags.add(tag));
            }
          });
          
          setTags(Array.from(allTags));
          
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
  
  // Get main categories for menubar, ensuring no duplicates
  const mainCategories = [
    { id: 'all', slug: 'all', name: 'All Articles' },
    // Filter the categories to include only those in MAIN_CATEGORY_SLUGS 
    // and ensure no duplicates by using a Set for the slugs
  ];
  
  // Create a Set to keep track of slugs we've already added
  const addedSlugs = new Set(['all']);
  
  // Add categories in the specified order without duplicates
  MAIN_CATEGORY_SLUGS.forEach(slug => {
    const category = categories.find((cat: any) => cat.slug === slug);
    if (category && !addedSlugs.has(category.slug)) {
      mainCategories.push(category);
      addedSlugs.add(category.slug);
    }
  });

  // Handle subcategory change
  const handleSubcategoryChange = (value: string) => {
    const params = new URLSearchParams();
    
    // Keep category parameter
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
    }
    
    // Set subcategory parameter if not 'all'
    if (value !== 'all') {
      params.set('subcategory', value);
    }
    
    // Keep active tags
    activeTags.forEach(tag => {
      params.append('tag', tag);
    });
    
    // Keep search query if present
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    router.push(`/articles?${params.toString()}`);
  };
  
  // Handle tag selection
  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams();
    
    // Keep category parameter
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
      
      // Keep subcategory parameter if present
      if (activeSubcategory !== 'all') {
        params.set('subcategory', activeSubcategory);
      }
    }
    
    // Toggle tag in active tags
    const newActiveTags = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    
    setActiveTags(newActiveTags);
    
    // Add tags to params
    newActiveTags.forEach(t => {
      params.append('tag', t);
    });
    
    // Keep search query if present
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    router.push(`/articles?${params.toString()}`);
  };
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Keep category parameter
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
      
      // Keep subcategory parameter if present
      if (activeSubcategory !== 'all') {
        params.set('subcategory', activeSubcategory);
      }
    }
    
    // Add tags to params
    activeTags.forEach(tag => {
      params.append('tag', tag);
    });
    
    // Add search query if present
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    router.push(`/articles?${params.toString()}`);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveCategory('all');
    setActiveSubcategory('all');
    setActiveTags([]);
    setSearchQuery('');
    router.push('/articles');
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
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Subcategory Select Dropdown (only shown when a main category is selected) */}
        {activeCategory !== 'all' && subcategories.length > 0 && (
          <div className="mb-4 md:mb-0 w-full md:max-w-xs">
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
        
        {/* Search Bar */}
        <div className="w-full md:flex-1">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 border-zinc-700 text-white pl-10"
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-white text-black rounded-md font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
            
            {/* Only show clear filters button when there are active filters */}
            {(activeCategory !== 'all' || activeSubcategory !== 'all' || activeTags.length > 0 || searchQuery) && (
              <button 
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-2 bg-zinc-800 text-white rounded-md font-medium text-sm hover:bg-zinc-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </form>
        </div>
      </div>
      
      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-2 text-gray-400">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTags.includes(tag)
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active filters display */}
      {(activeTags.length > 0 || searchQuery) && (
        <div className="mb-8 bg-zinc-800/50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-400">Active filters:</span>
            
            {activeTags.map(tag => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1 text-white">
                {tag}
                <button onClick={() => handleTagClick(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1 text-white">
                Search: {searchQuery}
                <button onClick={() => {
                  setSearchQuery('');
                  
                  const params = new URLSearchParams();
                  if (activeCategory !== 'all') {
                    params.set('category', activeCategory);
                    if (activeSubcategory !== 'all') {
                      params.set('subcategory', activeSubcategory);
                    }
                  }
                  activeTags.forEach(tag => {
                    params.append('tag', tag);
                  });
                  
                  router.push(`/articles?${params.toString()}`);
                }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Results count */}
      <div className="mb-8">
        <p className="text-sm text-gray-400">
          Showing {articles.length} {articles.length === 1 ? 'article' : 'articles'}
        </p>
      </div>
      
      {/* Articles Grid */}
      {articles.length > 0 ? (
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
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500">No image</span>
                      </div>
                    )}
                    <div className="absolute top-0 left-0 m-4">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {categoryName}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {article.excerpt || article.subtitle || 'No excerpt available'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.tags && Array.isArray(article.tags) && article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-block bg-zinc-800 text-xs text-gray-400 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {publishDate && (
                      <p className="mt-3 text-xs text-gray-500">
                        {new Date(publishDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-bold mb-2">No articles found</h3>
          <p className="text-gray-400">Try adjusting your filters or search criteria</p>
          <button 
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-white text-black rounded-md font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
} 