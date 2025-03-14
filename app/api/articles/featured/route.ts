import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '3', 10);
  
  try {
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published articles, sorted by publish date and limited
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
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
      date: article.published_at || article.created_at,
      author: article.author_id, // You might need to join with authors table later
      readTime: article.reading_time ? `${article.reading_time} min` : undefined,
      status: article.status,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      featured_image: article.featured_image // Include original field to prevent breaking changes
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Featured articles API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 