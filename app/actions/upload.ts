'use server'

import { v2 as cloudinary } from 'cloudinary';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: File,
  area: ImageArea,
  section?: string,
  customFilename?: string
) {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const placement = IMAGE_PLACEMENTS[area];
    if (!placement) {
      throw new Error("Invalid image area");
    }

    // Generate a structured public_id
    let public_id = placement.path;
    if (section) {
      public_id += `/${section}`;
    }
    if (customFilename) {
      public_id += `/${customFilename}`;
    } else {
      // Generate a clean filename from the original
      const cleanFilename = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      public_id += `/${cleanFilename}`;
    }

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with proper transformations
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
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
            reject(error);
            return;
          }
          resolve(result);
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
} 