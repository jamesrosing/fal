import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const area = formData.get('area') as string;
    const path = formData.get('path') as string;
    const filename = formData.get('filename') as string | null;
    
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Construct the public_id (path + filename without extension)
    const fileBaseName = filename 
      ? filename.replace(/\.[^/.]+$/, "") // Remove extension if present
      : file.name.replace(/\.[^/.]+$/, "");
    
    const public_id = `${path}/${fileBaseName}`;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id,
          folder: 'gallery',
          resource_type: 'image',
          format: 'auto', // Automatically choose the best format
          quality: 'auto', // Automatically optimize quality
          fetch_format: 'auto', // Deliver in the best format for the client
          overwrite: true, // Replace existing file with same public_id
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // @ts-ignore - we know result will have these properties from Cloudinary
    const { secure_url, public_id: resultId, format } = result;

    return Response.json({
      success: true,
      url: secure_url,
      public_id: resultId,
      format
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return Response.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 