import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Create a Supabase client directly
const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Cloudinary config debug
console.log('Cloudinary config:', {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'missing',
  apiKeyExists: !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary with direct values if env vars are missing
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '956447123689192';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'zGsan0MXgwGKIGnQ0t1EVKYSqg0';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// Make the route work with Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Fallback data for sections
const fallbackAssets = [
  {
    public_id: 'global/logos/allure_md_plastic_surgery_dermatology_white_logo.png',
    format: 'png',
    url: `https://res.cloudinary.com/${cloudName}/image/upload/v1743748610/global/logos/allure_md_plastic_surgery_dermatology_white_logo.png`,
    width: 1045,
    height: 311,
    created_at: new Date().toISOString(),
    bytes: 29680,
    type: 'image',
    folder: 'global/logos'
  },
  {
    public_id: 'global/hero/hero-poster',
    format: 'jpg',
    url: `https://res.cloudinary.com/${cloudName}/image/upload/v1743748610/global/hero/hero-poster`,
    width: 1920,
    height: 1080,
    created_at: new Date().toISOString(),
    bytes: 0,
    type: 'image',
    folder: 'global/hero'
  },
  {
    public_id: 'global/hero/hero-fallback',
    format: 'jpg',
    url: `https://res.cloudinary.com/${cloudName}/image/upload/v1743748610/global/hero/hero-fallback`,
    width: 1920,
    height: 1080,
    created_at: new Date().toISOString(),
    bytes: 0,
    type: 'image',
    folder: 'global/hero'
  }
];

/**
 * GET handler for media assets API
 * Returns information about media assets directly from Cloudinary
 */
export async function GET() {
  try {
    // Always check if process.env values are actually available
    if (!apiKey || !apiSecret) {
      console.warn('Cloudinary API credentials missing - using fallback data');
      return NextResponse.json(fallbackAssets);
    }
    
    // Get data directly from Cloudinary
    try {
      console.log('Attempting to call Cloudinary API with config:', { 
        cloudName, 
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        prefix: 'global'
      });
      
      // Format the response
      const assets = result.resources.map((resource: any) => ({
        public_id: resource.public_id,
        format: resource.format,
        url: resource.secure_url || `https://res.cloudinary.com/${cloudName}/image/upload/${resource.public_id}`,
        width: resource.width || 0,
        height: resource.height || 0,
        created_at: resource.created_at || new Date().toISOString(),
        bytes: resource.bytes || 0,
        type: resource.resource_type || 'image',
        folder: resource.folder || resource.public_id.includes('/') ? resource.public_id.substring(0, resource.public_id.lastIndexOf('/')) : ''
      }));
      
      console.log('Cloudinary API returned', assets.length, 'assets');
      return NextResponse.json(assets);
    } catch (cloudinaryError) {
      console.error('Cloudinary API error:', cloudinaryError);
      
      // Try to get data from Supabase as fallback
      try {
        const supabase = createClient();
        const { data: mediaAssets, error: dbError } = await supabase
          .from('media_assets')
          .select('*');
        
        if (!dbError && mediaAssets && mediaAssets.length > 0) {
          console.log('Using database fallback for media assets');
          // Format the response to match Cloudinary format
          const assets = mediaAssets.map(asset => ({
            public_id: asset.public_id,
            format: asset.format || 'jpg',
            url: asset.url || `https://res.cloudinary.com/${cloudName}/image/upload/${asset.public_id}`,
            width: asset.width || 0,
            height: asset.height || 0,
            created_at: asset.created_at || new Date().toISOString(),
            bytes: 0,
            type: asset.type || 'image',
            folder: asset.public_id.includes('/') ? asset.public_id.substring(0, asset.public_id.lastIndexOf('/')) : 'allure-md'
          }));
          
          return NextResponse.json(assets);
        }
      } catch (dbError) {
        console.error('Database fallback error:', dbError);
      }
      
      // If all else fails, return hard-coded fallback data
      console.info('Using hardcoded fallback media assets');
      return NextResponse.json(fallbackAssets);
    }
  } catch (error) {
    console.error('Error fetching media assets:', error);
    // Always return the fallbacks with 200 status to prevent UI blocking
    return NextResponse.json(fallbackAssets, { status: 200 });
  }
}

/**
 * POST handler for media assets API
 * Allows adding a new media asset to the database
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Parse the request body
    const body = await request.json();
    const { publicId, title, altText, tags, width, height, format, type = 'image' } = body;
    
    // Validate required fields
    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing required field: publicId' },
        { status: 400 }
      );
    }
    
    // Add the media asset to the database
    const { data, error } = await supabase
      .from('media_assets')
      .upsert({
        public_id: publicId,
        title: title || '',
        alt_text: altText || '',
        tags: tags || [],
        width: width || 0,
        height: height || 0,
        format: format || '',
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'public_id'
      });
    
    if (error) {
      console.error('Error adding media asset to database:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding media asset:', error);
    return NextResponse.json(
      { error: 'Failed to add media asset' },
      { status: 500 }
    );
  }
} 