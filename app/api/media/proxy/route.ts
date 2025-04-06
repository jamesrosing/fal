import { NextRequest, NextResponse } from 'next/server';
import { getMediaUrl } from '@/lib/media/utils';
import mediaRegistry from '@/lib/media/registry';

export async function GET(request: NextRequest) {
  const searchParams = await request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required parameter: id' },
      { status: 400 }
    );
  }
  
  // Get URL from ID
  const asset = mediaRegistry.getAsset(id);
  const url = asset 
    ? getMediaUrl(asset.publicId)
    : getMediaUrl(id);
  
  // Fetch the media
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: response.status }
      );
    }
    
    // Get the response body as array buffer
    const buffer = await response.arrayBuffer();
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the proxied media
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying media:', error);
    return NextResponse.json(
      { error: 'Failed to proxy media' },
      { status: 500 }
    );
  }
} 