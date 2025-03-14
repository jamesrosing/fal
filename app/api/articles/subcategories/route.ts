import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ARTICLE_SUBCATEGORIES } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    
    if (!categorySlug) {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
    }
    
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

    // Fetch the category to confirm it exists and get its ID
    const { data: category, error: categoryError } = await supabase
      .from('article_categories')
      .select('*')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      console.log('Category not found:', categorySlug);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    console.log('Found category:', { slug: categorySlug, id: category.id, name: category.name });
    
    // Also fetch the Educational category if it exists
    const { data: educationalCategory, error: educationalError } = await supabase
      .from('article_categories')
      .select('*')
      .eq('slug', 'educational')
      .single();
    
    let educationalCategoryId = null;
    if (!educationalError && educationalCategory) {
      educationalCategoryId = educationalCategory.id;
      console.log('Found Educational category:', educationalCategoryId);
    }
    
    // Prepare to fetch subcategories from both the requested category and educational category
    let subcategoriesQuery = supabase
      .from('article_subcategories')
      .select('*')
      .order('name', { ascending: true });
    
    if (educationalCategoryId) {
      // If educational category exists, fetch from both categories
      subcategoriesQuery = subcategoriesQuery.or(`category_id.eq.${category.id},category_id.eq.${educationalCategoryId}`);
    } else {
      // Otherwise just fetch from the requested category
      subcategoriesQuery = subcategoriesQuery.eq('category_id', category.id);
    }
    
    const { data: databaseSubcategories, error: subcategoryError } = await subcategoriesQuery;

    // Log for debugging
    console.log('Subcategories API found:', {
      categorySlug,
      categoryId: category.id,
      educationalCategoryId,
      subCategoriesCount: databaseSubcategories?.length || 0
    });

    // If we have database subcategories, return them
    if (!subcategoryError && databaseSubcategories && databaseSubcategories.length > 0) {
      return NextResponse.json(databaseSubcategories);
    }

    // If no subcategories were found, log a helpful message
    console.log('No subcategories found for category:', categorySlug);
    
    // Fallback to static subcategories defined in types.ts if available
    const staticSubcategories = ARTICLE_SUBCATEGORIES[categorySlug as keyof typeof ARTICLE_SUBCATEGORIES];
    
    if (staticSubcategories && staticSubcategories.length > 0) {
      const formattedSubcategories = staticSubcategories.map((subcat: any) => ({
        id: subcat.id,
        slug: subcat.id,
        name: subcat.name,
        description: subcat.description || '',
        category_id: category.id
      }));
      
      return NextResponse.json(formattedSubcategories);
    }
    
    // Return empty array if no subcategories found
    return NextResponse.json([]);
  } catch (error) {
    console.error('Subcategories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new subcategory
export async function POST(request: Request) {
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
    
    // Create the subcategory
    const { data, error } = await supabase
      .from('article_subcategories')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        category_id: body.category_id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create subcategory' },
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