import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * API route for creating a new media asset placeholder in Supabase
 * POST /api/media/assets/create
 * 
 * Request body:
 * {
 *   placeholder_id: string;
 *   cloudinary_id?: string;
 *   metadata?: object;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { placeholder_id, cloudinary_id = '', metadata = {} } = body;
    
    // Validate placeholder_id
    if (!placeholder_id) {
      return NextResponse.json(
        { error: 'Missing placeholder_id parameter' },
        { status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabase = createClient();
    
    // Check if placeholder already exists
    const { data: existingData, error: checkError } = await supabase
      .from('media_assets')
      .select('placeholder_id')
      .eq('placeholder_id', placeholder_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing placeholder:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing placeholder' },
        { status: 500 }
      );
    }
    
    if (existingData) {
      return NextResponse.json(
        { error: `Placeholder with ID "${placeholder_id}" already exists` },
        { status: 409 }
      );
    }
    
    // Insert new placeholder
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        placeholder_id,
        cloudinary_id,
        metadata,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'system'
      });
    
    if (error) {
      console.error('Error creating new placeholder:', error);
      return NextResponse.json(
        { error: 'Failed to create new placeholder' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Created new placeholder: ${placeholder_id}`
    });
  } catch (error) {
    console.error('Error in create media asset API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 