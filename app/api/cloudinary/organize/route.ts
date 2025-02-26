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
    if (!body.name) {
      return NextResponse.json({ error: 'Missing collection name' }, { status: 400 });
    }

    // Create collection from tag or folder
    const result = await createCollection(
      body.name,
      body.tag,
      body.folder
    );

    return NextResponse.json({ 
      success: true, 
      message: `Successfully created or updated collection: ${body.name}`,
      result 
    });
  } catch (error) {
    console.error('Error creating Cloudinary collection:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
} 