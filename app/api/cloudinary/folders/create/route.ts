import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createServerClient } from '@/lib/supabase';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

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
    const { name, parent } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }
    
    // Sanitize folder name (remove special characters, spaces to underscores)
    const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    
    try {
      // Create the folder in Cloudinary
      let folderPath = sanitizedName;
      
      // If parent folder specified, include it in the path
      if (parent && parent.trim() !== '') {
        folderPath = `${parent}/${sanitizedName}`;
      }
      
      // Cloudinary doesn't have a direct "create folder" API
      // Instead, create a placeholder file in the folder path, then delete it
      const uploadResult = await cloudinary.uploader.upload(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        {
          folder: folderPath,
          public_id: 'folder_placeholder',
          resource_type: 'raw'
        }
      );
      
      // Delete the placeholder file
      await cloudinary.uploader.destroy(`${folderPath}/folder_placeholder`, { resource_type: 'raw' });
      
      return NextResponse.json({
        success: true,
        folder: {
          name: sanitizedName,
          path: folderPath
        }
      });
    } catch (error) {
      console.error('Error creating Cloudinary folder:', error);
      return NextResponse.json(
        { error: 'Failed to create folder in Cloudinary' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 