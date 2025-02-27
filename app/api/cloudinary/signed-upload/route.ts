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

    // Create parameters to sign - include ALL parameters from the original request
    // This is critical for the signature to match what Cloudinary expects
    const timestamp = params.timestamp || Math.floor(Date.now() / 1000).toString();
    
    // Create a new object with all original parameters plus timestamp
    const paramsToSign: Record<string, string> = {
      ...params,  // Include all original parameters (folder, tags, source, etc.)
      timestamp   // Add or update the timestamp
    };
    
    // Don't include the api_key in the parameters to sign - we'll add it separately
    delete paramsToSign.api_key;
    
    // Generate signature
    const signature = await generateSignature(paramsToSign);
    console.log('Generated signature for string:', paramsToSign);

    // Return all needed parameters for the upload
    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
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
    // Explicitly do NOT add API key to parameters for signature
    // This aligns with Cloudinary's approach that handles api_key separately
    
    // Create a sorted string of parameters
    const sortedParams = Object.keys(params).sort();
    
    // Construct the string to sign with sorted parameters
    const paramString = sortedParams
      .map(key => `${key}=${params[key]}`)
      .join('&');
      
    console.log('String to sign:', paramString);
    
    // Create SHA-1 hash of the parameters + API secret
    const msgUint8 = new TextEncoder().encode(paramString + apiSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8); // Cloudinary uses SHA-1
    
    // Convert to hex string
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    console.log('Generated signature:', signature);
    return signature;
  } catch (error) {
    console.error('Error in signature generation:', error);
    throw error;
  }
} 