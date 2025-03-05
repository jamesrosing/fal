import { NextRequest, NextResponse } from 'next/server';
import { organizeAssets, createCollection } from '@/lib/cloudinary-server-actions';
import type { OrganizeOptions } from '@/lib/cloudinary';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    if (!body.publicIds || !Array.isArray(body.publicIds) || body.publicIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid publicIds' }, { status: 400 });
    }

    const options: OrganizeOptions = {
      publicIds: body.publicIds,
      folder: body.folder,
      tags: body.tags,
      context: body.context,
      addTags: body.addTags !== false // Default to true
    };
    
    // Organize assets with tags, folders, and context
    const results = await organizeAssets(options);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully organized ${body.publicIds.length} assets`,
      results
    });
  } catch (error) {
    console.error('Error organizing Cloudinary assets:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    if (!body.collections || (!Array.isArray(body.collections) && !body.name)) {
      return NextResponse.json({ error: 'Missing collection information' }, { status: 400 });
    }

    // For backward compatibility, convert a single name to collections array
    const collections = body.collections || [body.name];
    
    // Create collections from tag or folder
    const results = [];
    
    for (const collectionName of collections) {
      const result = await createCollection(
        collectionName,
        body.tag,
        body.folder
      );
      results.push(result);
      
      // If publicId provided, add it to the collection
      if (body.publicId) {
        try {
          const organizeResult = await organizeAssets({
            publicIds: [body.publicId],
            tags: [collectionName]
          });
          console.log(`Added ${body.publicId} to collection ${collectionName}`);
        } catch (err) {
          console.error(`Error adding asset to collection ${collectionName}:`, err);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully created or updated ${results.length} collections`,
      results 
    });
  } catch (error) {
    console.error('Error creating Cloudinary collections:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
} 