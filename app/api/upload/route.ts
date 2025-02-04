import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';
import { Readable } from 'stream';

// Set runtime to nodejs
export const runtime = 'nodejs';
export const maxDuration = 60; // Set max duration to 60 seconds for large uploads

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function bufferToStream(buffer: Buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
}

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

    // Convert File to Buffer and then to Stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const stream = bufferToStream(buffer);

    // Upload to Cloudinary using stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id,
          folder: placement.path,
          transformation: placement.transformations,
          resource_type: "auto",
          overwrite: true,
          tags: [area, section].filter(Boolean),
          context: {
            area: area,
            section: section || "",
            dimensions: `${placement.dimensions.width}x${placement.dimensions.height}`,
            aspect_ratio: placement.dimensions.aspectRatio.toString()
          }
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
            return;
          }
          resolve(result);
        }
      );

      // Pipe the stream to the upload stream
      stream.pipe(uploadStream);
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
} 