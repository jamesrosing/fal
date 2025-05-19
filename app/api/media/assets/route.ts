import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for fetching all media assets from Supabase
 * GET /api/media/assets
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const cloudinaryId = searchParams.get('cloudinary_id');
    
    let query = supabase
      .from('media_assets')
      .select('*');
    
    // Add filter by cloudinary_id if provided
    if (cloudinaryId) {
      query = query.eq('cloudinary_id', cloudinaryId);
    }
    
    // Order by created_at (newest first) instead of placeholder_id
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching media assets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media assets' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ mediaAssets: data });
  } catch (error) {
    console.error('Error in media assets API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 