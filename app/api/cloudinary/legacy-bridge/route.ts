import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { 
  getCloudinaryUrl, 
  getCloudinaryVideoUrl, 
  getMediaType
} from '@/lib/cloudinary';

/**
 * Legacy Bridge API route for compatibility with older placeholder-based implementations
 * This route accepts a placeholderId parameter and forwards to the new direct Cloudinary API
 * 
 * @route GET /api/cloudinary/legacy-bridge?placeholderId=xyz
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeholderId = searchParams.get('placeholderId');
  
  if (!placeholderId) {
    return NextResponse.json(
      { error: 'Missing placeholderId parameter' },
      { status: 400 }
    );
  }
  
  // Extract optional parameters
  const width = searchParams.get('width') ? parseInt(searchParams.get('width') || '0', 10) : undefined;
  const height = searchParams.get('height') ? parseInt(searchParams.get('height') || '0', 10) : undefined;
  const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality') || '0', 10) : undefined;
  const format = searchParams.get('format') || 'auto';
  
  try {
    // Connect to Supabase to fetch the public_id
    const supabase = createClient();
    
    // Try to find the asset by placeholder ID
    const { data, error } = await supabase
      .from('media_assets')
      .select('public_id, metadata')
      .or(`placeholder_id.eq.${placeholderId},metadata->legacy_placeholder_id.eq.${placeholderId}`)
      .maybeSingle();
    
    if (error || !data || !data.public_id) {
      console.error(`Error or no data found for placeholderId ${placeholderId}:`, error);
      return NextResponse.json(
        { error: 'Failed to find Cloudinary asset for this placeholder' },
        { status: 404 }
      );
    }
    
    const publicId = data.public_id;
    
    // Redirect to the direct Cloudinary asset API
    const encodedPublicId = encodeURIComponent(publicId).replace(/\//g, '|');
    
    // Build query parameters
    let queryString = '';
    if (width) queryString += `&width=${width}`;
    if (height) queryString += `&height=${height}`;
    if (quality) queryString += `&quality=${quality}`;
    if (format) queryString += `&format=${format}`;
    
    if (queryString) {
      queryString = '?' + queryString.substring(1); // Replace the first & with ?
    }
    
    // Return redirect response
    return NextResponse.redirect(
      new URL(`/api/cloudinary/asset/${encodedPublicId}${queryString}`, request.nextUrl.origin)
    );
  } catch (error) {
    console.error('Error in legacy bridge API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}