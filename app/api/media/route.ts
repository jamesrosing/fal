import { NextRequest, NextResponse } from 'next/server';
import { getMediaPublicId, getMediaPublicIds, updateMediaAsset } from '@/lib/media-utils';

/**
 * API route for fetching media public IDs from Supabase
 * GET /api/media?placeholderId=home-hero
 * GET /api/media?placeholderIds=home-hero,about-hero,services-hero
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeholderId = searchParams.get('placeholderId');
  const placeholderIds = searchParams.get('placeholderIds');

  // If placeholderId is provided, fetch a single public ID
  if (placeholderId) {
    const publicId = await getMediaPublicId(placeholderId);
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ publicId });
  }
  
  // If placeholderIds is provided, fetch multiple public IDs
  if (placeholderIds) {
    const ids = placeholderIds.split(',');
    const publicIds = await getMediaPublicIds(ids);
    
    return NextResponse.json({ publicIds });
  }
  
  // If neither is provided, return an error
  return NextResponse.json(
    { error: 'Missing placeholderId or placeholderIds parameter' },
    { status: 400 }
  );
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