import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper type for request body
interface OrganizeRequest {
  assets: string[];
  action: 'move' | 'delete' | 'tag';
  folder?: string;
  tag?: string;
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session || !sessionData.session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify admin role
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get request body
    const { assets, action, folder, tag } = await request.json() as OrganizeRequest;
    
    // Validate required fields
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { error: 'No assets specified' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'No action specified' },
        { status: 400 }
      );
    }
    
    // Process based on action
    switch (action) {
      case 'move':
        if (!folder) {
          return NextResponse.json(
            { error: 'Destination folder required for move action' },
            { status: 400 }
          );
        }
        
        // Move assets to the specified folder
        const moveResults = await Promise.all(
          assets.map(async (assetId) => {
            try {
              // Get the Cloudinary ID from the database
              const { data: asset } = await supabase
                .from('media_assets')
                .select('cloudinary_id')
                .eq('id', assetId)
                .single();
              
              if (!asset) {
                return { id: assetId, success: false, error: 'Asset not found' };
              }
              
              // Move the asset in Cloudinary
              const result = await cloudinary.uploader.rename(
                asset.cloudinary_id,
                `${folder}/${asset.cloudinary_id.split('/').pop()}`,
                { overwrite: true }
              );
              
              // Update the asset in the database
              await supabase
                .from('media_assets')
                .update({
                  cloudinary_id: result.public_id,
                  url: result.secure_url,
                  folder,
                  updated_at: new Date().toISOString()
                })
                .eq('id', assetId);
              
              return { id: assetId, success: true };
            } catch (error) {
              console.error(`Error moving asset ${assetId}:`, error);
              return { id: assetId, success: false, error: String(error) };
            }
          })
        );
        
        return NextResponse.json({ results: moveResults });
        
      case 'delete':
        // Delete assets
        const deleteResults = await Promise.all(
          assets.map(async (assetId) => {
            try {
              // Get the Cloudinary ID from the database
              const { data: asset } = await supabase
                .from('media_assets')
                .select('cloudinary_id')
                .eq('id', assetId)
                .single();
              
              if (!asset) {
                return { id: assetId, success: false, error: 'Asset not found' };
              }
              
              // Delete the asset from Cloudinary
              await cloudinary.uploader.destroy(asset.cloudinary_id);
              
              // Delete the asset from the database
              await supabase
                .from('media_assets')
                .delete()
                .eq('id', assetId);
              
              return { id: assetId, success: true };
            } catch (error) {
              console.error(`Error deleting asset ${assetId}:`, error);
              return { id: assetId, success: false, error: String(error) };
            }
          })
        );
        
        return NextResponse.json({ results: deleteResults });
        
      case 'tag':
        if (!tag) {
          return NextResponse.json(
            { error: 'Tag required for tag action' },
            { status: 400 }
          );
        }
        
        // Add tag to assets
        const tagResults = await Promise.all(
          assets.map(async (assetId) => {
            try {
              // Get the Cloudinary ID from the database
              const { data: asset } = await supabase
                .from('media_assets')
                .select('cloudinary_id, tags')
                .eq('id', assetId)
                .single();
              
              if (!asset) {
                return { id: assetId, success: false, error: 'Asset not found' };
              }
              
              // Add tag to the asset in Cloudinary
              await cloudinary.uploader.add_tag(tag, [asset.cloudinary_id]);
              
              // Update the asset in the database
              const currentTags = asset.tags || [];
              const updatedTags = Array.from(new Set([...currentTags, tag]));
              
              await supabase
                .from('media_assets')
                .update({
                  tags: updatedTags,
                  updated_at: new Date().toISOString()
                })
                .eq('id', assetId);
              
              return { id: assetId, success: true };
            } catch (error) {
              console.error(`Error tagging asset ${assetId}:`, error);
              return { id: assetId, success: false, error: String(error) };
            }
          })
        );
        
        return NextResponse.json({ results: tagResults });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error organizing assets:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 