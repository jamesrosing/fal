import { NextRequest, NextResponse } from 'next/server';
import { getMediaPublicId, getMediaPublicIds, updateMediaAsset } from '@/lib/media-utils';
import { createClient } from '@/lib/supabase';
import mediaRegistry from '@/lib/media/registry';
import { getMediaUrl } from '@/lib/media/utils';

/**
 * API route for fetching media public IDs from Supabase
 * GET /api/media/[id] - Path parameter based
 * GET /api/media?id=home-hero - Query parameter based (legacy)
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const placeholderId = searchParams.get('placeholderId');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const quality = searchParams.get('quality');

  // Extract ID from path if using the new path parameter approach
  const pathname = request.nextUrl.pathname;
  const pathId = pathname.startsWith('/api/media/') ? 
    pathname.substring('/api/media/'.length) : null;
  
  // Determine which ID to use (prioritize path parameter, then query parameters)
  const mediaId = pathId || id || placeholderId;
  
  if (!mediaId) {
    return NextResponse.json(
      { error: 'Missing required parameter: id or placeholderId' },
      { status: 400 }
    );
  }
  
  // If the ID contains a slash, it's likely already a Cloudinary public ID
  if (mediaId.includes('/')) {
    // It's already a Cloudinary public ID, just return it directly
    const isVideo = mediaId.includes('/video/') || /\.(mp4|mov|avi|webm)$/i.test(mediaId);
    
    // Transform options
    const options = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : undefined,
    };
    
    // Get the URL
    const url = getMediaUrl(mediaId, options);
    
    return NextResponse.json({
      id: mediaId,
      publicId: mediaId,
      type: isVideo ? 'video' : 'image',
      url
    });
  }
  
  // Otherwise try to find in media_assets table
  try {
    const supabase = createClient();
    
    // First check by legacy_placeholder_id in metadata
    const { data: metadataData, error: metadataError } = await supabase
      .from('media_assets')
      .select('public_id, type, width, height, title, alt_text, metadata')
      .filter('metadata->legacy_placeholder_id', 'eq', mediaId)
      .maybeSingle();
      
    if (!metadataError && metadataData) {
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: quality ? parseInt(quality) : undefined,
      };
      
      // Get the URL
      const url = getMediaUrl(metadataData.public_id, options);
      
      return NextResponse.json({
        id: mediaId,
        publicId: metadataData.public_id,
        type: metadataData.type,
        url,
        width: metadataData.width,
        height: metadataData.height,
        title: metadataData.title,
        altText: metadataData.alt_text,
        metadata: metadataData.metadata
      });
    }
    
    // Check if it's a direct ID in the public_id column
    const { data, error } = await supabase
      .from('media_assets')
      .select('public_id, type, width, height, title, alt_text, metadata')
      .eq('public_id', mediaId)
      .maybeSingle();
      
    if (!error && data) {
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        quality: quality ? parseInt(quality) : undefined,
      };
      
      // Get the URL
      const url = getMediaUrl(data.public_id, options);
      
      return NextResponse.json({
        id: mediaId,
        publicId: data.public_id,
        type: data.type,
        url,
        width: data.width,
        height: data.height,
        title: data.title,
        altText: data.alt_text,
        metadata: data.metadata
      });
    }
  } catch (error) {
    console.error('Error querying media_assets table:', error);
  }
  
  // Fallback to legacy registry
  const asset = mediaRegistry.getAsset(mediaId);
  
  if (!asset) {
    return NextResponse.json(
      { error: 'Media asset not found' },
      { status: 404 }
    );
  }
  
  // Transform options
  const options = {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : undefined,
  };
  
  // Get the URL
  const url = getMediaUrl(asset.publicId, options);
  
  // Return asset with URL
  return NextResponse.json({
    id: asset.id,
    publicId: asset.publicId,
    type: asset.type,
    url,
    dimensions: asset.dimensions,
  });
}

/**
 * API route for updating media public IDs in Supabase
 * POST /api/media
 * Body: { id: string, publicId: string, metadata?: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, placeholderId, publicId, metadata = {} } = body;
    
    // Use id or fall back to placeholderId for legacy support
    const mediaId = id || placeholderId;
    
    if (!mediaId || !publicId) {
      return NextResponse.json(
        { error: 'Missing id/placeholderId or publicId' },
        { status: 400 }
      );
    }
    
    // Insert or update in the media_assets table directly
    try {
      const supabase = createClient();
      
      // Check if it already exists in media_assets
      let existingRecord = null;
      
      // Try to find by legacy placeholder ID first
      const { data: metadataData } = await supabase
        .from('media_assets')
        .select('id')
        .filter('metadata->legacy_placeholder_id', 'eq', mediaId)
        .maybeSingle();
        
      if (metadataData) {
        existingRecord = metadataData;
      } else {
        // Then try by public_id
        const { data } = await supabase
          .from('media_assets')
          .select('id')
          .eq('public_id', publicId)
          .maybeSingle();
          
        if (data) {
          existingRecord = data;
        }
      }
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('media_assets')
          .update({
            public_id: publicId,
            metadata: {
              ...metadata,
              legacy_placeholder_id: mediaId
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
          
        if (error) {
          console.error('Error updating media_assets:', error);
          throw new Error(`Failed to update media asset: ${error.message}`);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('media_assets')
          .insert({
            public_id: publicId,
            type: metadata.type || (publicId.includes('/video/') ? 'video' : 'image'),
            title: metadata.title || mediaId,
            alt_text: metadata.alt_text || metadata.title || mediaId,
            width: metadata.width || null,
            height: metadata.height || null,
            metadata: {
              ...metadata,
              legacy_placeholder_id: mediaId
            }
          });
          
        if (error) {
          console.error('Error inserting to media_assets:', error);
          throw new Error(`Failed to insert media asset: ${error.message}`);
        }
      }
      
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
    
    // Legacy fallback if needed
    const success = await updateMediaAsset(mediaId, publicId, metadata);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update media asset' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update media' },
      { status: 500 }
    );
  }
} 