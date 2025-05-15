import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client directly
const createClient = () => {
  // Try to use service role key first for better permissions
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );
  }
  
  // Fall back to anon key if service role not available
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Fallback featured articles
const fallbackFeaturedArticles = [
  {
    id: "featured-1",
    slug: "medical-spa-innovations",
    title: "New Medical Spa Treatments for 2025",
    subtitle: "Cutting-edge non-invasive procedures",
    excerpt: "Discover the latest medical spa treatments that offer amazing results with minimal downtime.",
    image: "/images/articles/medical-spa-innovations.jpg",
    featured_image: "/images/articles/medical-spa-innovations.jpg",
    category: "medical-spa",
    categoryName: "Medical Spa",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "featured-2",
    slug: "collagen-boosting-techniques",
    title: "Natural Ways to Boost Collagen Production",
    subtitle: "Dermatologist-recommended practices",
    excerpt: "Learn effective methods to naturally enhance your skin's collagen for a more youthful appearance.",
    image: "/images/articles/collagen-boosting.jpg",
    featured_image: "/images/articles/collagen-boosting.jpg",
    category: "dermatology",
    categoryName: "Dermatology",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "featured-3",
    slug: "body-contouring-guide",
    title: "Complete Guide to Body Contouring",
    subtitle: "Surgical and non-surgical options",
    excerpt: "A comprehensive look at the latest body contouring procedures and what might be right for you.",
    image: "/images/articles/body-contouring.jpg",
    featured_image: "/images/articles/body-contouring.jpg",
    category: "plastic-surgery",
    categoryName: "Plastic Surgery",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '3', 10);
  
  try {
    // Initialize Supabase client
    try {
      const supabase = createClient();

      // Fetch published articles, sorted by publish date and limited
      const { data: articleData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('is_draft', false)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (articlesError) {
        console.error('Supabase query error:', articlesError);
        // Return fallbacks on error
        return NextResponse.json(fallbackFeaturedArticles);
      }

      // Check if we got empty results - return fallbacks instead
      if (!articleData || articleData.length === 0) {
        console.log('No featured articles found in database, using fallbacks');
        return NextResponse.json(fallbackFeaturedArticles);
      }

      // Get category data in a separate query if needed
      let categories: Record<string, { id: string; name: string; slug: string }> = {};
      if (articleData?.length > 0) {
        // Collect unique category IDs
        const categoryIds = Array.from(new Set(articleData.map(article => article.category_id).filter(Boolean)));
        
        if (categoryIds.length > 0) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('article_categories')
            .select('id, name, slug')
            .in('id', categoryIds);

          if (!categoryError && categoryData) {
            // Create a lookup object
            categories = categoryData.reduce((acc, category) => ({
              ...acc,
              [category.id]: category
            }), {} as Record<string, { id: string; name: string; slug: string }>);
          }
        }
      }

      // Format the data to match the expected Article interface
      const formattedArticles = articleData.map(article => {
        // Get category info from our lookup if available
        const categoryInfo = article.category_id ? categories[article.category_id] : null;
        
        return {
          id: article.id,
          slug: article.slug,
          title: article.title,
          subtitle: article.subtitle,
          excerpt: article.excerpt,
          content: article.content,
          image: article.featured_image,
          category: categoryInfo?.slug || null,
          categoryName: categoryInfo?.name || null,
          category_id: article.category_id,
          date: article.published_at || article.created_at,
          author: article.author_id, // You might need to join with authors table later
          readTime: article.reading_time ? `${article.reading_time} min` : undefined,
          status: article.is_draft ? 'draft' : 'published',
          publishedAt: article.published_at,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          featured_image: article.featured_image // Include original field to prevent breaking changes
        };
      });

      console.log('Featured articles API success:', formattedArticles.length, 'articles');
      return NextResponse.json(formattedArticles);
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return fallbacks when database is unavailable
      return NextResponse.json(fallbackFeaturedArticles);
    }
  } catch (error) {
    console.error('Featured articles API error:', error);
    // Always return fallbacks when there are errors
    return NextResponse.json(fallbackFeaturedArticles);
  }
} 