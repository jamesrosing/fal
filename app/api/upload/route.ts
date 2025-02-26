import { NextResponse } from 'next/server';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('Starting upload process in /api/upload endpoint');
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const area = formData.get("area") as ImageArea;
    const section = formData.get("section") as string;
    const customFilename = formData.get("filename") as string;

    console.log('Received form data:', { 
      area, 
      section, 
      customFilename,
      fileType: file?.type,
      fileSize: file?.size,
      formDataKeys: Array.from(formData.keys())
    });

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const placement = IMAGE_PLACEMENTS[area];
    if (!placement) {
      console.error(`Invalid image area: ${area}`);
      return NextResponse.json({ error: "Invalid image area" }, { status: 400 });
    }

    // Generate a structured public_id
    let public_id = placement.path;
    if (section) {
      public_id += `/${section}`;
    }
    if (customFilename) {
      public_id += `/${customFilename}`;
    } else {
      const cleanFilename = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      public_id += `/${cleanFilename}`;
    }

    console.log('Generated public_id:', public_id);

    const timestamp = Math.round(Date.now() / 1000).toString();
    const transformations = placement.transformations.join(',');
    
    // Prepare parameters for signature
    const params = {
      timestamp,
      public_id,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      transformation: transformations,
      tags: [area, section].filter(Boolean).join(','),
      context: JSON.stringify({
        area: area,
        section: section || "",
        dimensions: `${placement.dimensions.width}x${placement.dimensions.height}`,
        aspect_ratio: placement.dimensions.aspectRatio.toString()
      })
    };

    console.log('Signature parameters:', params);

    // Validate Cloudinary credentials
    if (!process.env.CLOUDINARY_API_KEY) {
      console.error('Missing CLOUDINARY_API_KEY');
      return NextResponse.json({ error: "Missing Cloudinary API key" }, { status: 500 });
    }
    
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing CLOUDINARY_API_SECRET');
      return NextResponse.json({ error: "Missing Cloudinary API secret" }, { status: 500 });
    }
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
      return NextResponse.json({ error: "Missing Cloudinary cloud name" }, { status: 500 });
    }

    // Generate signature first
    const signature = await generateSignature(params);
    console.log('Generated signature:', signature.slice(0, 10) + '...');

    // Create form data for Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', process.env.CLOUDINARY_API_KEY!);
    uploadFormData.append('timestamp', timestamp);
    uploadFormData.append('signature', signature);

    // Add all other parameters that were used in signature
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        uploadFormData.append(key, value.toString());
      }
    });

    console.log('Cloudinary upload form data keys:', Array.from(uploadFormData.keys()));

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log('Uploading to Cloudinary URL:', cloudinaryUrl);
    
    const uploadResponse = await fetch(
      cloudinaryUrl,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    console.log('Cloudinary response status:', uploadResponse.status, uploadResponse.statusText);

    if (!uploadResponse.ok) {
      let errorText = 'Unknown error';
      let errorJson = {};
      
      try {
        errorJson = await uploadResponse.json();
        console.error('Cloudinary error JSON:', errorJson);
        errorText = JSON.stringify(errorJson);
      } catch (parseError) {
        try {
          errorText = await uploadResponse.text();
          console.error('Cloudinary error text:', errorText);
        } catch (textError) {
          console.error('Failed to get error text:', textError);
        }
      }
      
      return NextResponse.json({ 
        error: `Cloudinary upload failed: ${errorText}`,
        details: errorJson
      }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();
    console.log('Cloudinary upload success:', { 
      url: result.secure_url,
      public_id: result.public_id,
    });
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type
      }
    });
  } catch (error) {
    console.error("Upload error details:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        stack: errorStack,
        message: "Upload failed with an unexpected error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { public_id } = await request.json();
    
    if (!public_id) {
      return NextResponse.json({ error: "No public_id provided" }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    
    // Prepare parameters for signature
    const params = {
      public_id,
      timestamp,
    };

    // Generate signature
    const signature = await generateSignature(params);

    // Create form data for Cloudinary
    const deleteFormData = new FormData();
    deleteFormData.append('public_id', public_id);
    deleteFormData.append('api_key', process.env.CLOUDINARY_API_KEY!);
    deleteFormData.append('timestamp', timestamp);
    deleteFormData.append('signature', signature);

    // Delete from Cloudinary
    const deleteResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: deleteFormData,
      }
    );

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.error('Cloudinary error:', error);
      throw new Error(error.message || 'Delete failed');
    }

    const result = await deleteResponse.json();
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}

async function generateSignature(params: Record<string, any>) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  
  // Sort parameters alphabetically and filter out undefined/null/empty values
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        acc[key] = params[key];
      }
      return acc;
    }, {});

  // Create signature string
  const signatureString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&') + apiSecret;

  // Use Web Crypto API which is available in Edge Runtime
  const msgUint8 = new TextEncoder().encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  
  // Convert hash to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
} 