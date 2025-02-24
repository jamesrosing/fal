import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Article } from '@/lib/supabase';

// Move initialization into the handler to prevent top-level errors
export async function GET() {
  try {
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

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to connect to database',
          details: testError.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch articles
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(name)
      `)
      .order('created_at', { ascending: false });

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

    console.log('Articles API success:', {
      count: data?.length || 0
    });

    return new NextResponse(
      JSON.stringify(data || []),
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