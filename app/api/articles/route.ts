import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Article } from '@/lib/supabase';

// Create a Supabase client directly
const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Fallback articles for when the database is unavailable
const fallbackArticles = [
  {
    id: "fallback-1",
    slug: "plastic-surgery-trends",
    title: "Latest Plastic Surgery Trends",
    subtitle: "What's new in aesthetic procedures",
    excerpt: "Discover the latest innovations and techniques in plastic surgery that are transforming the field.",
    content: "<p>Content would appear here in the full version.</p>",
    image: "/images/articles/plastic-surgery-trends.jpg",
    featured_image: "/images/articles/plastic-surgery-trends.jpg",
    category: "plastic-surgery",
    categoryName: "Plastic Surgery",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "fallback-2",
    slug: "functional-medicine-benefits",
    title: "The Benefits of Functional Medicine",
    subtitle: "A holistic approach to health",
    excerpt: "Learn how functional medicine addresses the root causes of health issues rather than just treating symptoms.",
    content: "<p>Content would appear here in the full version.</p>",
    image: "/images/articles/functional-medicine.jpg",
    featured_image: "/images/articles/functional-medicine.jpg",
    category: "functional-medicine",
    categoryName: "Functional Medicine",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "fallback-3",
    slug: "dermatology-skin-health",
    title: "Essential Skin Health Tips",
    subtitle: "Dermatologist-approved advice",
    excerpt: "Expert dermatological advice for maintaining healthy skin in every season.",
    content: "<p>Content would appear here in the full version.</p>",
    image: "/images/articles/dermatology-tips.jpg",
    featured_image: "/images/articles/dermatology-tips.jpg",
    category: "dermatology",
    categoryName: "Dermatology",
    date: new Date().toISOString(),
    status: "published",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Move initialization into the handler to prevent top-level errors
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category');
    const subcategory = url.searchParams.get('subcategory');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    
    // Initialize Supabase client
    try {
      const supabase = createClient();

      // Build the query - query articles first
      const query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      // Apply filters
      if (categoryId) {
        query.eq('category_id', categoryId);
      }
      
      if (subcategory) {
        query.eq('subcategory', subcategory);
      }
      
      // Apply pagination
      query.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data: articleData, error: articlesError } = await query;

      if (articlesError) {
        console.error('Supabase query error:', articlesError);
        return new NextResponse(
          JSON.stringify(fallbackArticles),
          {
            status: 200, // Return 200 with fallbacks instead of 500
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if we got empty results - return fallbacks instead
      if (!articleData || articleData.length === 0) {
        console.log('No articles found in database, using fallbacks');
        return new NextResponse(
          JSON.stringify(fallbackArticles),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
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
          subcategory: article.subcategory,
          date: article.published_at || article.created_at,
          author: article.author_id, // You might need to join with authors table later
          readTime: article.reading_time ? `${article.reading_time} min` : undefined,
          status: article.status,
          publishedAt: article.published_at,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          featured_image: article.featured_image // Include original field to prevent breaking changes
        };
      });

      console.log('Articles API success:', {
        count: formattedArticles.length
      });

      return new NextResponse(
        JSON.stringify(formattedArticles),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return fallback articles if database connection fails
      return new NextResponse(
        JSON.stringify(fallbackArticles),
        {
          status: 200, // Still return 200 status to prevent UI errors
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Articles API error:', error);
    // Return fallbacks even on general errors
    return new NextResponse(
      JSON.stringify(fallbackArticles),
      {
        status: 200, // Still return 200 status to prevent UI errors
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    const article = await req.json();
    
    // Generate slug from title
    article.slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure content is a valid JSONB array
    if (!article.content) {
      article.content = [];
    }

    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to create article',
          details: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Articles API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to create article',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 