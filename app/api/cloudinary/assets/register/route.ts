import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { getMediaType } from '@/lib/cloudinary';

/**
 * API route for registering a new Cloudinary asset in the database
 * POST /api/cloudinary/assets/register
 * 
 * Request body:
 * {
 *   public_id: string;  // Cloudinary public_id
 *   title?: string;     // Optional title
 *   alt_text?: string;  // Optional alt text
 *   width?: number;     // Optional width
 *   height?: number;    // Optional height
 *   metadata?: object;  // Optional metadata
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { 
      public_id,
      title = '',
      alt_text = '',
      width,
      height,
      metadata = {}
    } = body;
    
    // Validate public_id
    if (!public_id) {
      return NextResponse.json(
        { error: 'Missing public_id parameter' },
        { status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabase = createClient();
    
    // Check if asset already exists
    const { data: existingData, error: checkError } = await supabase
      .from('media_assets')
      .select('id')
      .eq('public_id', public_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing asset:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing asset' },
        { status: 500 }
      );
    }
    
    const type = getMediaType(public_id);
    
    if (existingData) {
      // Update existing asset
      const { error: updateError } = await supabase
        .from('media_assets')
        .update({
          title: title || null,
          alt_text: alt_text || null,
          width: width || null,
          height: height || null,
          metadata: metadata || {},
          type,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id);
      
      if (updateError) {
        console.error('Error updating asset:', updateError);
        return NextResponse.json(
          { error: 'Failed to update asset' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        message: `Updated asset: ${public_id}`,
        id: existingData.id
      });
    } else {
      // Insert new asset
      const { data: insertData, error: insertError } = await supabase
        .from('media_assets')
        .insert({
          public_id,
          title: title || null,
          alt_text: alt_text || null,
          width: width || null,
          height: height || null,
          metadata: metadata || {},
          type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating new asset:', insertError);
        return NextResponse.json(
          { error: 'Failed to create new asset' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        message: `Created new asset: ${public_id}`,
        id: insertData.id
      });
    }
  } catch (error) {
    console.error('Error in register asset API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}