import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * API route to generate Cloudinary upload signatures
 * This allows us to perform signed uploads without exposing API secrets to the client
 * 
 * @see https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
export async function POST(request: NextRequest) {
  console.log('Processing signed upload request');
  
  // Check for required environment variables
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary credentials');
    return NextResponse.json(
      { error: 'Server configuration error - missing Cloudinary credentials' },
      { status: 500 }
    );
  }

  try {
    // Extract parameters from request
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    // Convert FormData to plain object
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        params[key] = value;
      }
    });
    
    console.log('Request parameters:', params);

    // Create parameters to sign
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Per Cloudinary's documentation, we only need these key parameters for a valid signature
    const paramsToSign: Record<string, string> = {
      timestamp,
      // If a folder is specified, include it
      ...(params.folder ? { folder: params.folder } : {}),
      // If tags are specified, include them
      ...(params.tags ? { tags: params.tags } : {}),
    };
    
    // Generate signature
    const signature = await generateSignature(paramsToSign);
    console.log('Generated signature for params:', paramsToSign);

    // Return all needed parameters for the upload
    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate signature', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a Cloudinary signature per their documentation
 * @see https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
async function generateSignature(params: Record<string, any>) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
  
  try {
    // Add API key to parameters
    params.api_key = process.env.CLOUDINARY_API_KEY;
    
    // Create a sorted string of parameters
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
      
    console.log('String to sign:', paramString);
    
    // Create SHA-1 hash of the parameters + API secret
    const msgUint8 = new TextEncoder().encode(paramString + apiSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8); // Cloudinary uses SHA-1
    
    // Convert to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error in signature generation:', error);
    throw error;
  }
} 