import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for category
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Categories API Environment Check:', {
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
      .from('article_categories')
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

    // Fetch categories
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('order_position', { ascending: true })
      .order('name', { ascending: true });

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

    console.log('Categories API success:', {
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
    console.error('Categories API error:', error);
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
    
    const body = await req.json();
    const validated = categorySchema.parse(body);
    
    // Get the highest order_position
    const { data: lastCategory, error: orderError } = await supabase
      .from('article_categories')
      .select('order_position')
      .order('order_position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (lastCategory?.order_position ?? -1) + 1;
    
    // Generate slug from name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('article_categories')
      .insert([{ 
        ...validated, 
        slug,
        order_position: nextPosition
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to create category',
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
    console.error('Categories API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to create category',
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