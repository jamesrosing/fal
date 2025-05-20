import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for fetching all Cloudinary media assets from Supabase
 * GET /api/cloudinary/assets/list?type=image&limit=20&page=1
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Start building query
    let query = supabase
      .from('media_assets')
      .select('*');
    
    // Apply folder filter if provided
    if (folder) {
      query = query.eq('folder', folder);
    }
    
    // Apply type filter if provided
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,alt_text.ilike.%${search}%,cloudinary_id.ilike.%${search}%`);
    }
    
    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'name_asc':
        query = query.order('title', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('title', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      assets: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}