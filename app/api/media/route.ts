import { NextRequest, NextResponse } from 'next/server';
import { getMediaPublicId, getMediaPublicIds, updateMediaAsset } from '@/lib/media-utils';
import mediaRegistry from '@/lib/media/registry';
import { getMediaUrl } from '@/lib/media/utils';

/**
 * API route for fetching media public IDs from Supabase
 * GET /api/media?placeholderId=home-hero
 * GET /api/media?placeholderIds=home-hero,about-hero,services-hero
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = await request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const quality = searchParams.get('quality');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required parameter: id' },
      { status: 400 }
    );
  }
  
  // Get asset from registry
  const asset = mediaRegistry.getAsset(id);
  
  if (!asset) {
    return NextResponse.json(
      { error: 'Media asset not found' },
      { status: 404 }
    );
  }
  
  // Transform options
  const options = {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : undefined,
  };
  
  // Get the URL
  const url = getMediaUrl(asset.publicId, options);
  
  // Return asset with URL
  return NextResponse.json({
    id: asset.id,
    publicId: asset.publicId,
    type: asset.type,
    url,
    dimensions: asset.dimensions,
  });
}

/**
 * API route for updating media public IDs in Supabase
 * POST /api/media
 * Body: { placeholderId: string, publicId: string, metadata?: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeholderId, publicId, metadata = {} } = body;
    
    if (!placeholderId || !publicId) {
      return NextResponse.json(
        { error: 'Missing placeholderId or publicId' },
        { status: 400 }
      );
    }
    
    // Call updateMediaAsset from lib/media-utils.ts
    const success = await updateMediaAsset(placeholderId, publicId, metadata);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update media asset' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
} 