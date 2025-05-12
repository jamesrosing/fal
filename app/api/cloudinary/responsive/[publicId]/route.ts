import { NextRequest, NextResponse } from 'next/server';
import { 
  getCloudinaryUrl, 
  getCloudinaryVideoUrl, 
  getCloudinaryImageSrcSet,
  isCloudinaryVideo,
  getMediaType
} from '@/lib/cloudinary';

/**
 * API route for generating responsive image URLs from Cloudinary
 * GET /api/cloudinary/responsive/[publicId]?width=1200&quality=80
 */
export async function GET(
  request: NextRequest,
  context: { params: { publicId: string } }
) {
  let publicId = context.params.publicId;
  const searchParams = request.nextUrl.searchParams;
  
  // Handle encoded slashes in the publicId
  publicId = publicId.replace(/\|/g, '/');
  
  // Parse optional parameters with defaults
  const width = parseInt(searchParams.get('width') || '1920', 10);
  const height = searchParams.has('height') ? parseInt(searchParams.get('height') || '0', 10) : undefined;
  const quality = parseInt(searchParams.get('quality') || '80', 10);
  const format = searchParams.get('format') || 'auto';
  
  if (!publicId) {
    return NextResponse.json(
      { error: 'Missing publicId parameter' },
      { status: 400 }
    );
  }
  
  try {
    const mediaType = getMediaType(publicId);
    const isVideo = mediaType === 'video';
    
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
      url = getCloudinaryUrl(publicId, { width, height, quality, format });
      srcSet = getCloudinaryImageSrcSet(publicId, { quality, format });
    }
    
    return NextResponse.json({
      url,
      srcSet,
      publicId,
      isVideo,
      sizes: [
        { width: 640, url: getCloudinaryUrl(publicId, { width: 640, quality, format }) },
        { width: 750, url: getCloudinaryUrl(publicId, { width: 750, quality, format }) },
        { width: 828, url: getCloudinaryUrl(publicId, { width: 828, quality, format }) },
        { width: 1080, url: getCloudinaryUrl(publicId, { width: 1080, quality, format }) },
        { width: 1200, url: getCloudinaryUrl(publicId, { width: 1200, quality, format }) },
        { width: 1920, url: getCloudinaryUrl(publicId, { width: 1920, quality, format }) },
        { width: 2048, url: getCloudinaryUrl(publicId, { width: 2048, quality, format }) },
      ]
    });
  } catch (error) {
    console.error('Error generating responsive media URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate responsive media URLs' },
      { status: 500 }
    );
  }
}