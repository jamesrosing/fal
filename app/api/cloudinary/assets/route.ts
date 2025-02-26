import { NextRequest, NextResponse } from 'next/server';
import { ImageArea } from '@/lib/cloudinary';

// Edge runtime is maintained
export const runtime = 'edge';

// Define the expected shape of Cloudinary resource from their API
interface CloudinaryResource {
  public_id: string;
  folder?: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw';
  tags?: string[];
  context?: Record<string, string>;
}

// Define the Cloudinary search API request type
interface CloudinarySearchRequest {
  expression: string;
  max_results: number;
  sort_by: Array<Record<string, string>>;
  with_field: string[];
  resource_type: string;
  next_cursor?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filtering parameters
    const area = searchParams.get('area') as ImageArea | undefined;
    const resourceType = searchParams.get('resourceType') as 'image' | 'video' | undefined;
    const folder = searchParams.get('folder');
    const tag = searchParams.get('tag');
    const searchTerm = searchParams.get('searchTerm');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const nextCursor = searchParams.get('nextCursor');
    
    // Build search expression for Cloudinary
    const expressions: string[] = [];
    
    if (area) {
      expressions.push(`folder=${area}/*`);
    }
    
    if (folder) {
      expressions.push(`folder=${folder}/*`);
    }
    
    if (tag) {
      expressions.push(`tags=${tag}`);
    }
    
    if (searchTerm) {
      expressions.push(`public_id:*${searchTerm}*`);
    }
    
    // Prepare resource type for search (default to image)
    const searchResourceType = resourceType || 'image';
    
    // Use fetch to call Cloudinary's REST API directly instead of the SDK
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication method for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Build the search request body
    const searchBody: CloudinarySearchRequest = {
      expression: expressions.length > 0 ? expressions.join(' AND ') : '',
      max_results: pageSize,
      sort_by: [{ created_at: 'desc' }],
      with_field: ['context', 'tags'],
      resource_type: searchResourceType
    };
    
    // Add next_cursor if provided
    if (nextCursor) {
      searchBody.next_cursor = nextCursor;
    }
    
    // Call Cloudinary Search API
    const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(searchBody)
    });
    
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('Cloudinary API error:', errorData);
      return NextResponse.json(
        { error: `Cloudinary API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: searchResponse.status }
      );
    }
    
    const result = await searchResponse.json();
    
    // Transform Cloudinary response to match our CloudinaryAsset type
    const assets = result.resources.map((resource: CloudinaryResource) => ({
      publicId: resource.public_id,
      area: resource.folder?.split('/')[0] as ImageArea || 'gallery', // Assume first folder part is area
      width: resource.width,
      height: resource.height,
      format: resource.format,
      resourceType: resource.resource_type,
      tags: resource.tags || [],
      context: resource.context || {}
    }));
    
    return NextResponse.json({
      assets,
      hasMore: result.next_cursor !== undefined,
      nextCursor: result.next_cursor
    });
  } catch (error) {
    console.error('Error fetching Cloudinary assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets from Cloudinary' },
      { status: 500 }
    );
  }
} 