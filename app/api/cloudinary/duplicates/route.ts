import { NextRequest, NextResponse } from 'next/server';

// Edge runtime support
export const runtime = 'edge';

interface DuplicateGroup {
  publicIds: string[];
  similarity: number;
}

interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
}

export async function POST(request: NextRequest) {
  try {
    const { threshold = 0.8 } = await request.json();
    
    // Validate Cloudinary credentials
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Call Cloudinary's duplicate detection API
    // Note: This requires the Duplicate Image Detection add-on
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/duplicates`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        threshold
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if the error is related to the add-on not being enabled
      if (errorData.error?.message?.includes('add-on')) {
        return NextResponse.json(
          { 
            error: 'Duplicate Image Detection add-on not enabled',
            message: 'This feature requires the Cloudinary Duplicate Image Detection add-on. Please enable it in your Cloudinary account.',
            details: errorData
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to detect duplicates', details: errorData },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    // Process and organize duplicates for easier UI display
    const duplicateGroups: DuplicateGroup[] = [];
    
    if (result.duplicates) {
      for (const group of result.duplicates) {
        duplicateGroups.push({
          publicIds: group.public_ids,
          similarity: group.similarity
        });
      }
    }
    
    return NextResponse.json({
      duplicateGroups,
      count: duplicateGroups.length,
      threshold
    });
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to detect duplicates', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Alternative implementation using perceptual hashing for basic duplicate detection
// This can be used if the Cloudinary add-on is not available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // Validate Cloudinary credentials
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!apiKey || !apiSecret || !cloudName) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Fetch assets first
    const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expression: folder ? `folder=${folder}/*` : '',
        max_results: limit,
        with_field: ['context', 'tags', 'image_metadata'],
      })
    });
    
    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch assets' },
        { status: searchResponse.status }
      );
    }
    
    const searchResult = await searchResponse.json();
    const assets = searchResult.resources || [] as CloudinaryAsset[];
    
    // Create basic duplicate groups by filename, size, and dimensions
    // This is a simpler approach than perceptual hashing
    const sizeMap = new Map<number, CloudinaryAsset[]>();
    const dimensionMap = new Map<string, CloudinaryAsset[]>();
    const filenameMap = new Map<string, CloudinaryAsset[]>();
    
    assets.forEach((asset: CloudinaryAsset) => {
      // Group by file size
      const size = asset.bytes;
      if (!sizeMap.has(size)) sizeMap.set(size, []);
      sizeMap.get(size)?.push(asset);
      
      // Group by dimensions
      const dimensions = `${asset.width}x${asset.height}`;
      if (!dimensionMap.has(dimensions)) dimensionMap.set(dimensions, []);
      dimensionMap.get(dimensions)?.push(asset);
      
      // Group by filename (without path)
      const filename = asset.public_id.split('/').pop() || '';
      if (!filenameMap.has(filename)) filenameMap.set(filename, []);
      filenameMap.get(filename)?.push(asset);
    });
    
    // Find potential duplicates (assets that share multiple characteristics)
    const potentialDuplicates: Array<{
      criteria: string;
      publicIds: string[];
      assets: Array<{
        publicId: string;
        url: string;
        width: number;
        height: number;
        format: string;
        created: string;
      }>;
    }> = [];
    
    // Check size groups
    for (const [size, sizeGroup] of Array.from(sizeMap.entries())) {
      if (sizeGroup.length > 1) {
        // Further refine by dimensions
        const sizeAndDimGroups = new Map<string, CloudinaryAsset[]>();
        
        sizeGroup.forEach((asset: CloudinaryAsset) => {
          const dimensions = `${asset.width}x${asset.height}`;
          if (!sizeAndDimGroups.has(dimensions)) sizeAndDimGroups.set(dimensions, []);
          sizeAndDimGroups.get(dimensions)?.push(asset);
        });
        
        // Add dimension groups with multiple assets as potential duplicates
        for (const [dimensions, assets] of Array.from(sizeAndDimGroups.entries())) {
          if (assets.length > 1) {
            potentialDuplicates.push({
              criteria: `size ${size} bytes, dimensions ${dimensions}`,
              publicIds: assets.map((a: CloudinaryAsset) => a.public_id),
              assets: assets.map((a: CloudinaryAsset) => ({
                publicId: a.public_id,
                url: a.secure_url,
                width: a.width,
                height: a.height,
                format: a.format,
                created: a.created_at
              }))
            });
          }
        }
      }
    }
    
    // Check filename groups (different paths but same filename)
    for (const [filename, assets] of Array.from(filenameMap.entries())) {
      if (assets.length > 1 && filename) { // Ensure filename isn't empty
        potentialDuplicates.push({
          criteria: `filename "${filename}"`,
          publicIds: assets.map((a: CloudinaryAsset) => a.public_id),
          assets: assets.map((a: CloudinaryAsset) => ({
            publicId: a.public_id,
            url: a.secure_url,
            width: a.width,
            height: a.height,
            format: a.format,
            created: a.created_at
          }))
        });
      }
    }
    
    return NextResponse.json({
      potentialDuplicates,
      count: potentialDuplicates.length,
      totalAssets: assets.length,
      message: potentialDuplicates.length > 0 
        ? 'Potential duplicates found based on size, dimensions, and filename' 
        : 'No potential duplicates found'
    });
  } catch (error) {
    console.error('Error finding potential duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to find potential duplicates', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 