import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for fetching all Cloudinary media assets from Supabase
 * GET /api/cloudinary/assets/list?type=image&limit=20&page=1
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    const folder = searchParams.get('folder');
    
    const supabase = createClient();
    
    let query = supabase
      .from('media_assets')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (type) {
      query = query.eq('type', type);
    }
    
    if (folder) {
      query = query.ilike('public_id', `${folder}/%`);
    }
    
    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching media assets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media assets' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      mediaAssets: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Error in media assets API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}