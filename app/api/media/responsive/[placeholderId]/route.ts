import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { 
  getCloudinaryUrl, 
  getCloudinaryVideoUrl,
  getCloudinaryImageSrcSet,
  isCloudinaryVideo 
} from '@/lib/cloudinary';

/**
 * API route for generating responsive image URLs
 * GET /api/media/responsive/[placeholderId]?width=1200&quality=80
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { placeholderId: string } }
) {
  const placeholderId = params.placeholderId;
  const searchParams = await request.nextUrl.searchParams;
  
  // Parse optional parameters with defaults
  const width = parseInt(searchParams.get('width') || '1920', 10);
  const quality = parseInt(searchParams.get('quality') || '80', 10);
  const format = searchParams.get('format') || 'auto';
  
  if (!placeholderId) {
    return NextResponse.json(
      { error: 'Missing placeholderId parameter' },
      { status: 400 }
    );
  }
  
  try {
    const supabase = createClient();
    
    // Get the media asset from Supabase
    const { data, error } = await supabase
      .from('media_assets')
      .select('cloudinary_id, metadata')
      .eq('placeholder_id', placeholderId)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }
    
    const publicId = data.cloudinary_id;
    const isVideo = isCloudinaryVideo(publicId) || 
                   (data.metadata && data.metadata.resource_type === 'video');
    
    // Generate different URL formats based on asset type
    let url, srcSet;
    
    if (isVideo) {
      url = getCloudinaryVideoUrl(publicId, { 
        format: format === 'auto' ? 'mp4' : format, 
        quality, 
        width 
      });
      
      // For videos, we don't use srcSet in the same way as images
      srcSet = undefined;
    } else {
      // For images, generate standard responsive formats
      url = getCloudinaryUrl(publicId, { width, quality, format });
      srcSet = getCloudinaryImageSrcSet(publicId, { quality, format });
    }
    
    return NextResponse.json({
      url,
      srcSet,
      publicId,
      isVideo
    });
  } catch (error) {
    console.error('Error generating responsive media URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate responsive media URLs' },
      { status: 500 }
    );
  }
} 