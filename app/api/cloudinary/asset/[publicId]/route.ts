import { NextRequest, NextResponse } from 'next/server';
import { 
  getCloudinaryUrl, 
  getCloudinaryVideoUrl, 
  isCloudinaryVideo,
  getMediaType
} from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase';

/**
 * GET handler for retrieving Cloudinary assets directly by publicId
 * 
 * This API route handles direct retrieval of Cloudinary assets by their publicId.
 * It also attempts to get metadata from the database if available.
 * 
 * @route GET /api/cloudinary/asset/[publicId]
 */
export async function GET(
  request: NextRequest,
  context: { params: { publicId: string } }
) {
  // Get the public ID from the URL path
  let publicId = context.params.publicId;
  
  if (!publicId) {
    return NextResponse.json(
      { error: 'Missing publicId parameter' },
      { status: 400 }
    );
  }
  
  // Handle encoded slashes in the publicId
  publicId = publicId.replace(/\|/g, '/');
  
  try {
    // Extract optional query parameters for transformations
    const searchParams = request.nextUrl.searchParams;
    const width = searchParams.get('width') ? parseInt(searchParams.get('width') || '0', 10) : undefined;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height') || '0', 10) : undefined;
    const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality') || '0', 10) : undefined;
    const format = searchParams.get('format') || 'auto';
    
    // Determine if this is a video or image
    const mediaType = getMediaType(publicId);
    const isVideo = mediaType === 'video';
    
    // Generate the appropriate URL
    const url = isVideo
      ? getCloudinaryVideoUrl(publicId, { width, format, quality })
      : getCloudinaryUrl(publicId, { width, height, quality, format });
    
    // Try to get additional metadata from the database
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('title, alt_text, width, height, metadata')
      .eq('public_id', publicId)
      .maybeSingle();
    
    // Return asset data with the URL
    return NextResponse.json({
      publicId,
      type: mediaType,
      url,
      width: data?.width || width || null,
      height: data?.height || height || null,
      title: data?.title || null,
      altText: data?.alt_text || null,
      metadata: data?.metadata || null
    });
  } catch (error) {
    console.error(`Error fetching Cloudinary asset for publicId ${publicId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch Cloudinary asset' },
      { status: 500 }
    );
  }
}