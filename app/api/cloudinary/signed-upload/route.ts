import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * API route to generate Cloudinary upload signatures
 * This allows us to perform signed uploads without exposing API secrets to the client
 * 
 * @see https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { folder = 'uploads' } = body;
    
    // Create the timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate the signature for the given parameters
    // This will allow direct upload to Cloudinary with our credentials
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    // Return the signature, timestamp, and API key
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate Cloudinary signature' },
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