import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getMediaType } from '@/lib/cloudinary';
import { cookies } from 'next/headers';

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
export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    
    // Extract session cookie manually from headers
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/sb-[^=]+=([^;]+)/);
    const session = sessionMatch ? sessionMatch[1] : null;
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify the user is authenticated using session 
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session || !sessionData.session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to register assets' },
        { status: 401 }
      );
    }
    
    const user = sessionData.session.user;
    
    // Get user role
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You must be an admin to register assets' },
        { status: 403 }
      );
    }
    
    // Get the request body
    const {
      cloudinary_id,
      type,
      format,
      width,
      height,
      url,
      size,
      title,
      alt_text,
      tags,
      folder
    } = await request.json();
    
    // Validate required fields
    if (!cloudinary_id || !url || !type) {
      return NextResponse.json(
        { error: 'cloudinary_id, url, and type are required' },
        { status: 400 }
      );
    }
    
    // Check if this asset already exists in the database
    const { data: existingAsset } = await supabase
      .from('media_assets')
      .select('id')
      .eq('cloudinary_id', cloudinary_id)
      .single();
    
    if (existingAsset) {
      // Update the existing asset
      const { data, error } = await supabase
        .from('media_assets')
        .update({
          type,
          format,
          width,
          height,
          url,
          size,
          title: title || cloudinary_id.split('/').pop(),
          alt_text: alt_text || cloudinary_id.split('/').pop(),
          tags,
          folder,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return NextResponse.json({ 
        message: 'Asset updated successfully', 
        asset: data 
      });
    }
    
    // Insert a new asset
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        cloudinary_id,
        type,
        format,
        width,
        height,
        url,
        size,
        title: title || cloudinary_id.split('/').pop(),
        alt_text: alt_text || cloudinary_id.split('/').pop(),
        tags,
        folder,
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      message: 'Asset registered successfully', 
      asset: data 
    });
    
  } catch (error) {
    console.error('Error registering asset:', error);
    return NextResponse.json(
      { error: 'Failed to register asset' },
      { status: 500 }
    );
  }
}