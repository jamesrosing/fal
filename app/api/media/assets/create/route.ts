import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for creating a new media asset in Supabase
 * POST /api/media/assets/create
 * 
 * Request body:
 * {
 *   cloudinary_id: string;
 *   type: 'image' | 'video';
 *   title?: string;
 *   alt_text?: string;
 *   width?: number;
 *   height?: number;
 *   format?: string;
 *   url?: string;
 *   metadata?: object;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { 
      cloudinary_id, 
      type = 'image',
      title = '',
      alt_text = '',
      width, 
      height,
      format,
      url = '',
      metadata = {} 
    } = body;
    
    // Validate cloudinary_id
    if (!cloudinary_id) {
      return NextResponse.json(
        { error: 'Missing cloudinary_id parameter' },
        { status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabase = createClient();
    
    // Check if asset already exists
    const { data: existingData, error: checkError } = await supabase
      .from('media_assets')
      .select('cloudinary_id')
      .eq('cloudinary_id', cloudinary_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing media asset:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing media asset' },
        { status: 500 }
      );
    }
    
    if (existingData) {
      return NextResponse.json(
        { error: `Media asset with cloudinary_id "${cloudinary_id}" already exists` },
        { status: 409 }
      );
    }
    
    // Insert new media asset
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        cloudinary_id,
        type,
        title,
        alt_text,
        width,
        height,
        format,
        url,
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating new media asset:', error);
      return NextResponse.json(
        { error: 'Failed to create new media asset' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Created new media asset: ${cloudinary_id}`,
      mediaAsset: data
    });
  } catch (error) {
    console.error('Error in create media asset API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 