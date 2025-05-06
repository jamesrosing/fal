import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Hardcoded fallback values (same as in assets route)
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyrzyfg3w";
const apiKey = process.env.CLOUDINARY_API_KEY || "956447123689192";
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Apply config
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export async function GET() {
  // Check environment variables
  const envStatus = {
    CLOUD_NAME_SET: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    API_KEY_SET: !!process.env.CLOUDINARY_API_KEY,
    API_SECRET_SET: !!process.env.CLOUDINARY_API_SECRET,
    UPLOAD_PRESET_SET: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    
    // Show what values we're actually using
    CLOUD_NAME_USED: cloudName === process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'From ENV' : 'From fallback',
    API_KEY_USED: apiKey === process.env.CLOUDINARY_API_KEY ? 'From ENV' : 'From fallback',
    API_SECRET_USED: apiSecret === process.env.CLOUDINARY_API_SECRET ? 'From ENV' : 'From fallback'
  };
  
  // Test Cloudinary configuration
  let cloudinaryStatus = 'Not tested';
  let resources = [];
  
  try {
    if (cloudName && apiKey && apiSecret) {
      // Try a simple API call to verify credentials
      await cloudinary.api.ping();
      cloudinaryStatus = 'Connection successful';
      
      // Try to fetch a sample of resources to confirm read access
      try {
        const resourcesResult = await cloudinary.api.resources({
          type: 'upload',
          max_results: 3
        });
        
        if (resourcesResult.resources && resourcesResult.resources.length > 0) {
          resources = resourcesResult.resources.slice(0, 3).map((r: any) => ({ 
            public_id: r.public_id,
            type: r.resource_type,
            format: r.format
          }));
          cloudinaryStatus += ' - Resource access confirmed';
        }
      } catch (err) {
        // We can still connect but maybe not read resources
        cloudinaryStatus += ' - But resource access failed';
      }
    } else {
      cloudinaryStatus = 'Missing required configuration values';
    }
  } catch (error: any) {
    cloudinaryStatus = `Error: ${error.message || 'Unknown error'}`;
  }
  
  return NextResponse.json({
    environmentVariables: envStatus,
    cloudName,
    cloudinaryStatus,
    resources: resources.length > 0 ? resources : undefined,
    nextEnvLoading: {
      dotEnvLoaded: true, // Next.js shows "Environments: .env" in startup logs
      dotEnvLocalLoaded: false, // Unknown if .env.local is loaded
    },
    suggestions: [
      'Make sure there are no typos in your variable names or values',
      'If changing .env, restart the Next.js server completely',
      'Try changing CLOUDINARY_API_KEY to NEXT_PUBLIC_CLOUDINARY_API_KEY',
      'For production, use .env.local instead of .env for sensitive values',
      'If all else fails, verify your Cloudinary credentials directly on their dashboard'
    ]
  });
} 