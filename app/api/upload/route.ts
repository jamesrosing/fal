import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    
    if (!file) {
      return new Response("No file uploaded", { status: 400 })
    }

    // @ts-expect-error - cloudinary v2 types are not up to date
    const result = await cloudinary.uploader.upload(await file.arrayBuffer(), {
      folder: type,
    })

    return new Response(JSON.stringify({ url: result.secure_url }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return new Response(error instanceof Error ? error.message : "Upload failed", { status: 500 })
  }
} 