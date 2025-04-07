// app/api/unified-media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mediaService, MediaAsset, MediaMapping } from '@/lib/services/media-service';
// Assume Cloudinary upload handling might be separate or handled client-side
// For PUT, we'll focus on updating the database mapping after an upload

// GET - Fetch media by placeholder ID(s) or all
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const ids = searchParams.get('ids');
  const getAll = searchParams.get('all');

  try {
    if (id) {
      const asset = await mediaService.getMediaByPlaceholderId(id);
      if (!asset) {
        return NextResponse.json({ error: 'Media not found for placeholder ID' }, { status: 404 });
      }
      return NextResponse.json(asset);
    }

    if (ids) {
      const placeholderIds = ids.split(',').map(pid => pid.trim()).filter(Boolean);
      if (placeholderIds.length === 0) {
         return NextResponse.json({ error: 'No valid placeholder IDs provided' }, { status: 400 });
      }
      const assets = await mediaService.getMultipleMediaByPlaceholderIds(placeholderIds);
      return NextResponse.json(assets);
    }

    if (getAll === 'true') {
      // Decide whether to return assets or mappings based on common use case.
      // Returning mappings might be lighter if only placeholder relations are needed.
      // Let's return mappings as per the documentation table structure hint.
      // Consider adding another flag like ?details=true to get full assets.
      const mappings = await mediaService.getAllMediaMappings();
      // Optionally, fetch all assets: const assets = await mediaService.getAllMediaAssets();
      return NextResponse.json(mappings);
    }

    return NextResponse.json({ error: 'Missing required query parameter: id, ids, or all=true' }, { status: 400 });

  } catch (error) {
    console.error('[API/UNIFIED-MEDIA GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Update media mapping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeholderId, cloudinaryId, metadata } = body;

    if (!placeholderId || !cloudinaryId) {
      return NextResponse.json({ error: 'Missing required fields: placeholderId and cloudinaryId' }, { status: 400 });
    }

    const mapping = await mediaService.updateMediaMapping(placeholderId, cloudinaryId, metadata);

    if (!mapping) {
      return NextResponse.json({ error: 'Failed to update media mapping' }, { status: 500 });
    }

    return NextResponse.json(mapping);

  } catch (error) {
    console.error('[API/UNIFIED-MEDIA POST] Error:', error);
    if (error instanceof SyntaxError) {
         return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Upload new media (handle DB update post-upload)
export async function PUT(request: NextRequest) {
  try {
    // Cloudinary upload should ideally happen client-side or via a dedicated signed upload endpoint.
    // This PUT endpoint assumes the upload is done and we receive the result to update the DB.
    // If handling file upload directly here, use FormData parsing.

    // Example assuming JSON body after client-side upload:
    const uploadResult = await request.json(); // Contains { placeholderId, cloudinaryResponse }
    const { placeholderId, cloudinaryResponse } = uploadResult;

    // --- OR --- Handling FormData if uploading through this endpoint:
    /*
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const placeholderId = formData.get('placeholderId') as string | null;
    const folder = formData.get('folder') as string | null; // Optional folder for Cloudinary

    if (!file || !placeholderId) {
      return NextResponse.json({ error: 'Missing file or placeholderId' }, { status: 400 });
    }

    // TODO: Implement actual Cloudinary Upload logic here or preferably
    // call a serverless function designed for uploads.
    // Example structure (replace with actual upload call):
    const cloudinaryResponse = await uploadToCloudinary(file, { folder });
    if (!cloudinaryResponse) {
       return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }
    */

    if (!placeholderId || !cloudinaryResponse || !cloudinaryResponse.public_id) {
      return NextResponse.json({ error: 'Missing placeholderId or invalid Cloudinary response' }, { status: 400 });
    }

    const mapping = await mediaService.handleNewUpload(placeholderId, cloudinaryResponse);

    if (!mapping) {
      return NextResponse.json({ error: 'Failed to create media asset or mapping after upload' }, { status: 500 });
    }

    return NextResponse.json(mapping, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('[API/UNIFIED-MEDIA PUT] Error:', error);
    // Handle specific errors like invalid FormData, JSON parsing errors etc.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove media mapping
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeholderId = searchParams.get('id');

  if (!placeholderId) {
    return NextResponse.json({ error: 'Missing required query parameter: id' }, { status: 400 });
  }

  try {
    const success = await mediaService.deleteMediaMapping(placeholderId);

    if (!success) {
      // Could be because mapping didn't exist or DB error
      // Consider checking if it existed first for a more specific response (404 vs 500)
      return NextResponse.json({ error: 'Failed to delete media mapping or mapping not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Media mapping deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error) {
    console.error('[API/UNIFIED-MEDIA DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}