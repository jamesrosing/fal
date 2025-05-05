import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client directly
const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createClient();

    // Fetch all categories
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new category
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();
    
    // Generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const { data, error } = await supabase
      .from('article_categories')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a category
export async function PUT(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
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
    // Initialize Supabase client
    const supabase = createClient();
    
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