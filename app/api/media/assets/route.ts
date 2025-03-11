import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for fetching all media assets from Supabase
 * GET /api/media/assets
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .order('placeholder_id');
    
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