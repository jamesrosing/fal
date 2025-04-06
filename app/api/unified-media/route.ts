import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/services/media-service';
import { createClient } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Unified Media API
 * 
 * Handles all media-related operations:
 * - GET /api/unified-media?id=placeholder-id (Get media by placeholder ID)
 * - GET /api/unified-media/assets (Get all media assets)
 * - POST /api/unified-media (Update media mapping)
 * - PUT /api/unified-media (Upload new media)
 * - DELETE /api/unified-media?id=placeholder-id (Delete media mapping)
 */

/**
 * GET handler - Fetch media assets
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const quality = searchParams.get('quality');
    const allAssets = searchParams.get('all') === 'true';
    
    // Query options
    const options = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : undefined,
    };
    
    // Get all assets
    if (allAssets) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ assets: data });
    }
    
    // Get media by multiple IDs
    if (ids) {
      const idArray = ids.split(',').map(id => id.trim());
      const result = await mediaService.getMediaByPlaceholderIds(idArray);
      
      // Generate URLs
      const withUrls = Object.entries(result).reduce((acc, [key, asset]) => {
        acc[key] = asset ? {
          ...asset,
          url: mediaService.getMediaUrl(asset, options)
        } : null;
        return acc;
      }, {} as Record<string, any>);
      
      return NextResponse.json({ assets: withUrls });
    }
    
    // Get single media by ID
    if (id) {
      const asset = await mediaService.getMediaByPlaceholderId(id);
      
      if (!asset) {
        return NextResponse.json(
          { error: 'Media asset not found' },
          { status: 404 }
        );
      }
      
      // Get URL with options
      const url = mediaService.getMediaUrl(asset, options);
      
      return NextResponse.json({
        ...asset,
        url
      });
    }
    
    return NextResponse.json(
      { error: 'Missing required parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Media API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Update media mappings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeholderId, cloudinaryId, metadata = {} } = body;
    
    if (!placeholderId || !cloudinaryId) {
      return NextResponse.json(
        { error: 'Missing placeholderId or cloudinaryId' },
        { status: 400 }
      );
    }
    
    // Update the mapping
    const success = await mediaService.updateMediaMapping(
      placeholderId,
      cloudinaryId,
      metadata
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update media mapping' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Media API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Upload new media directly to Cloudinary
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const placeholderId = formData.get('placeholderId') as string;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file || !placeholderId) {
      return NextResponse.json(
        { error: 'Missing file or placeholderId' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;
    
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder,
          resource_type: 'auto',
          public_id: placeholderId.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
    
    // Update mapping
    const success = await mediaService.updateMediaMapping(
      placeholderId,
      result.public_id,
      {
        title: placeholderId,
        alt_text: placeholderId,
        original_filename: file.name,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type
      }
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update media mapping after upload' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url
    });
  } catch (error: any) {
    console.error('Media Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Remove media mappings
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Get the mapping first
    const { data: mapping, error: mappingError } = await supabase
      .from('media_mappings')
      .select('id')
      .eq('placeholder_id', id)
      .single();
      
    if (mappingError) {
      return NextResponse.json(
        { error: 'Media mapping not found' },
        { status: 404 }
      );
    }
    
    // Delete the mapping
    const { error: deleteError } = await supabase
      .from('media_mappings')
      .delete()
      .eq('id', mapping.id);
      
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete media mapping' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Media API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
