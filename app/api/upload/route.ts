import { NextResponse } from 'next/server';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

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

    // Convert File to ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', new Blob([buffer]));
    uploadFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    uploadFormData.append('folder', placement.path);
    uploadFormData.append('public_id', public_id);
    
    // Add transformation parameters
    placement.transformations.forEach(transform => {
      uploadFormData.append('transformation', transform);
    });

    // Add tags and context
    uploadFormData.append('tags', [area, section].filter(Boolean).join(','));
    uploadFormData.append('context', JSON.stringify({
      area: area,
      section: section || "",
      dimensions: `${placement.dimensions.width}x${placement.dimensions.height}`,
      aspect_ratio: placement.dimensions.aspectRatio.toString()
    }));

    // Upload to Cloudinary using fetch
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
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