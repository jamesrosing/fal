"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set")
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set")
}

export async function processImage(formData: FormData) {
  const file = formData.get("image") as File
  if (!file) {
    throw new Error("No file uploaded")
  }

  try {
    // Upload the file to Vercel Blob
    const blob = await put(file.name, file, { 
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    })
    const imageUrl = blob.url

    console.log("Uploaded image URL:", imageUrl)
    
    const requestBody = {
      image_url: imageUrl,
      model: "General Use (Light)",
      output_format: "png",
      refine_foreground: true
    }
    
    console.log("Sending request to Fal AI:", requestBody)

    // Use Fal AI to remove the background
    const response = await fetch("https://fal.run/fal-ai/birefnet/v2", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Full API error response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      })
      throw new Error(
        `Fal AI API error (${response.status}): ${
          errorData?.error || response.statusText
        }`
      )
    }

    const result = await response.json()
    console.log("API response:", result)
    
    const processedImageUrl = result.image?.url

    if (!processedImageUrl) {
      throw new Error("No processed image URL returned from Fal AI")
    }

    revalidatePath("/")
    return { success: true, url: processedImageUrl }
  } catch (error) {
    console.error("Error processing image:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to process image")
  }
}

