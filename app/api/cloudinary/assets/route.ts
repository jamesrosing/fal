import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Log environment variable status (masking sensitive values)
console.log('Cloudinary ENV variables status:', {
  CLOUD_NAME_SET: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  API_KEY_SET: !!process.env.CLOUDINARY_API_KEY,
  API_SECRET_SET: !!process.env.CLOUDINARY_API_SECRET,
});

// Hardcoded config as fallback if env vars aren't working
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyrzyfg3w";
const apiKey = process.env.CLOUDINARY_API_KEY || "956447123689192";
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary with fixed values if env vars aren't working
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials in environment variables');
      return NextResponse.json({
        error: 'Cloudinary configuration is incomplete. Please check the diagnostic page for details.',
        resources: [],
        folders: []
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    
    // Get resources in the specified folder
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 50,
    });
    
    // Get subfolders in the specified folder
    const folders = await cloudinary.api.sub_folders(folder);
    
    return NextResponse.json({
      resources: resources.resources,
      folders: folders.folders.map((f: any) => ({
        name: f.name,
        path: f.path,
      })),
    });
  } catch (error: any) {
    console.error('Cloudinary API error:', error);
    
    // If the error is about folder not found, return empty results
    if (error.error?.message?.includes('not found')) {
      return NextResponse.json({ resources: [], folders: [] });
    }

    // If the error is about authentication, suggest checking credentials
    if (error.message?.includes('authentication')) {
      return NextResponse.json({
        error: 'Authentication error with Cloudinary. Please check your API key and secret.',
        resources: [],
        folders: []
      }, { status: 401 });
    }
    
    return NextResponse.json({
      error: error.message || 'Failed to fetch Cloudinary resources',
      resources: [],
      folders: []
    }, { status: 500 });
  }
} 