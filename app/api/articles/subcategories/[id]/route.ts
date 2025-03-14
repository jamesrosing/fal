import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Update a subcategory by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const subcategoryId = params.id;
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category_id) {
      return NextResponse.json(
        { error: 'Name and category_id are required' },
        { status: 400 }
      );
    }
    
    // Generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Update the subcategory
    const { data, error } = await supabase
      .from('article_subcategories')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        category_id: body.category_id
      })
      .eq('id', subcategoryId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update subcategory' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Subcategories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a subcategory by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const subcategoryId = params.id;
    
    // Check if subcategory is in use
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title')
      .eq('subcategory', subcategoryId)
      .limit(1);
    
    if (articlesError) {
      console.error('Supabase error:', articlesError);
      return NextResponse.json(
        { error: 'Failed to check subcategory usage' },
        { status: 500 }
      );
    }
    
    if (articles && articles.length > 0) {
      return NextResponse.json(
        { 
          error: 'Subcategory is in use', 
          message: 'This subcategory is currently used by articles and cannot be deleted' 
        },
        { status: 400 }
      );
    }
    
    // Delete the subcategory
    const { error } = await supabase
      .from('article_subcategories')
      .delete()
      .eq('id', subcategoryId);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete subcategory' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subcategories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 