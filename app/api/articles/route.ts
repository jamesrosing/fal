import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Article } from '@/lib/supabase';

// Move initialization into the handler to prevent top-level errors
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category');
    const subcategory = url.searchParams.get('subcategory');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Articles API Environment Check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      nodeEnv: process.env.NODE_ENV,
      url: supabaseUrl?.substring(0, 10) + '...',  // Log first 10 chars for debugging
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing Supabase environment variables',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            required: {
              url: 'NEXT_PUBLIC_SUPABASE_URL',
              key: 'SUPABASE_SERVICE_ROLE_KEY'
            }
          }
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build the query
    let query = supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database query failed',
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

    // Format the data to match the expected Article interface
    const formattedArticles = data.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content,
      image: article.featured_image,
      category: article.category?.slug,
      categoryName: article.category?.name,
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
    }));

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
  } catch (error) {
    console.error('Articles API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
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

export async function POST(req: Request) {
  try {
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing Supabase environment variables',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            required: {
              url: 'NEXT_PUBLIC_SUPABASE_URL',
              key: 'SUPABASE_SERVICE_ROLE_KEY'
            }
          }
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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