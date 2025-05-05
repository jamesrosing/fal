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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const tags = searchParams.getAll('tag');
    const search = searchParams.get('search');
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Start building query
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply category filter if provided
    if (category) {
      query = query.eq('category_id', category);
    }
    
    // Apply subcategory filter if provided
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    
    // Apply tag filters if provided
    if (tags && tags.length > 0) {
      // Use OR conditions to find articles that contain ANY of the specified tags
      const tagConditions = tags.map(tag => {
        // Properly escape the tag for ILIKE query to avoid SQL injection
        const escapedTag = tag.replace(/'/g, "''");
        // Use LIKE with an array_to_string conversion to search in the tags array
        return `tags ILIKE '%${escapedTag}%'`;
      });
      
      // Join the conditions with OR and wrap in parentheses
      query = query.or(tagConditions.join(','));
    }
    
    // Apply search filter if provided
    if (search) {
      const searchTerm = `%${search}%`;
      // Search in title, subtitle, content, excerpt
      query = query.or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return new Response(JSON.stringify({ error: 'Database query failed' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format the response
    const formattedArticles = await Promise.all(data.map(async (article) => {
      // Get category name if available
      let categoryName = null;
      
      if (article.category_id) {
        const { data: categoryData } = await supabase
          .from('article_categories')
          .select('name')
          .eq('id', article.category_id)
          .single();
          
        categoryName = categoryData?.name;
      }
      
      return {
        ...article,
        categoryName
      };
    }));
    
    return new Response(JSON.stringify(formattedArticles), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Articles API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
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