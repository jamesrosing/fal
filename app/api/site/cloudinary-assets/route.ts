import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary-server';

// Make the route work with Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define types for asset structure
interface CloudinaryAsset {
  id: string;
  publicId: string;
  name: string;
  format: string;
  type: 'image' | 'video' | 'raw';
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  folder?: string;
  uploadedAt: string;
  tags: string[];
}

/**
 * GET handler for Cloudinary assets API
 * Returns assets from Cloudinary, optionally filtered by folder
 */
export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const resourceType = searchParams.get('type') || 'image';
    const maxResults = parseInt(searchParams.get('max') || '100', 10);
    
    // Validate resource type
    if (!['image', 'video', 'raw', 'auto'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type. Must be one of: image, video, raw, auto' },
        { status: 400 }
      );
    }
    
    // Get assets from Cloudinary
    const options: any = {
      resource_type: resourceType,
      max_results: maxResults,
      type: 'upload'
    };
    
    // Add folder prefix if specified
    if (folder) {
      options.prefix = folder;
    }
    
    const result = await cloudinary.api.resources(options);
    
    // Transform the response to our format
    const assets: CloudinaryAsset[] = result.resources.map((resource: any) => ({
      id: resource.asset_id,
      publicId: resource.public_id,
      name: resource.public_id.split('/').pop() || resource.public_id,
      format: resource.format,
      type: resource.resource_type,
      url: resource.url,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      folder: resource.folder || '',
      uploadedAt: resource.created_at,
      tags: resource.tags || []
    }));
    
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching Cloudinary assets:', error);
    return NextResponse.json(
      { error: 'Failed to load Cloudinary assets' },
      { status: 500 }
    );
  }
} 