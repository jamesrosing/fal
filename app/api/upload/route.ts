import { NextResponse } from 'next/server';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary-client';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const area = formData.get("area") as ImageArea;
    const section = formData.get("section") as string;
    const customFilename = formData.get("filename") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const placement = IMAGE_PLACEMENTS[area];
    if (!placement) {
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

    // Generate signature first
    const signature = await generateSignature(params);

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

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('Cloudinary error:', error);
      throw new Error(error.message || 'Upload failed');
    }

    const result = await uploadResponse.json();
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
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

  // Generate SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
} 