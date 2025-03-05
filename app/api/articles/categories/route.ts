import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
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
    
    // Fetch categories
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('order_position', { ascending: true });

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

    // Return the categories
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

// Create a new category
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const category = await request.json();
    
    // Generate slug from name if not provided
    if (!category.slug && category.name) {
      category.slug = category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Get the highest order position and add 1 for the new category
    if (category.order_position === undefined) {
      const { data: maxOrderData } = await supabase
        .from('article_categories')
        .select('order_position')
        .order('order_position', { ascending: false })
        .limit(1);
      
      const maxOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].order_position 
        : 0;
        
      category.order_position = maxOrder + 1;
    }
    
    // Insert the new category
    const { data, error } = await supabase
      .from('article_categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create category', details: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify(data),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/articles/categories:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// Update a category
export async function PUT(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { id, ...categoryData } = await request.json();
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Category ID is required' }),
        { status: 400 }
      );
    }
    
    // Update slug if name changed and slug not provided
    if (categoryData.name && !categoryData.slug) {
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Update the category
    const { data, error } = await supabase
      .from('article_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update category', details: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify(data),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/articles/categories:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to update category',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// Delete a category
export async function DELETE(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get category ID from URL params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Category ID is required' }),
        { status: 400 }
      );
    }
    
    // Check if category is in use by any articles
    const { data: articleCount, error: countError } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('category_id', id);
      
    if (countError) {
      console.error('Error checking category usage:', countError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to check if category is in use', details: countError.message }),
        { status: 500 }
      );
    }
    
    if (articleCount && articleCount.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Cannot delete category that is in use',
          message: `This category is used by ${articleCount.length} article(s). Please reassign these articles to another category first.`
        }),
        { status: 400 }
      );
    }
    
    // Delete the category
    const { error } = await supabase
      .from('article_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to delete category', details: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      null,
      { status: 204 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/articles/categories:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete category',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 