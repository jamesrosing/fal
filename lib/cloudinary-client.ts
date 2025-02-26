/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the unified Cloudinary module from '@/lib/cloudinary' instead.
 * It provides all the same functionality with improved typings and organization.
 */

'use client';

export type ImageArea = 
  | "hero"
  | "article" 
  | "service"
  | "team"
  | "gallery"
  | "logo";

export interface ImagePlacement {
  path: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  transformations: string[];
}

export const IMAGE_PLACEMENTS: Record<ImageArea, ImagePlacement> = {
  hero: {
    path: "hero",
    description: "Main hero images for section headers",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  article: {
    path: "articles",
    description: "Article header images",
    dimensions: {
      width: 1200,
      height: 675,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  service: {
    path: "services",
    description: "Service category images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  team: {
    path: "team/headshots",
    description: "Team member headshots",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    transformations: ["c_fill", "g_face", "f_auto", "q_auto"]
  },
  gallery: {
    path: "gallery",
    description: "Gallery images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  logo: {
    path: "branding",
    description: "Logo and branding assets",
    dimensions: {
      width: 200,
      height: 0,
      aspectRatio: 0
    },
    transformations: ["c_scale", "f_auto", "q_auto"]
  }
};

// Client-side upload utilities
export async function uploadToCloudinary(
  file: File,
  area: ImageArea,
  section?: string,
  customFilename?: string
) {
  try {
    console.log(`Starting upload to Cloudinary: area=${area}, section=${section}, filename=${customFilename || file.name}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area', area);
    if (section) formData.append('section', section);
    if (customFilename) formData.append('filename', customFilename);

    console.log('Sending request to /api/upload endpoint with formData keys:', [...formData.keys()]);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Response from /api/upload:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
        // Try to get the response as text if JSON parsing fails
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        errorData = { rawResponse: textResponse };
      }
      
      console.error('Upload error response details:', {
        status: response.status,
        errorData
      });
      
      throw new Error(
        errorData.error ? 
        `Upload failed: ${errorData.error}` : 
        `Upload failed with status ${response.status}`
      );
    }

    const result = await response.json();
    console.log('Upload successful, result:', result);
    return result;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

export async function deleteFromCloudinary(public_id: string) {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id }),
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Delete error response:', result);
      throw new Error(result.error || 'Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete error:', error);
    throw error instanceof Error ? error : new Error('Delete failed');
  }
}

// URL Generation
export function getCloudinaryUrl(publicId: string, area: ImageArea, options: { width?: number; height?: number; quality?: number } = {}) {
  const placement = IMAGE_PLACEMENTS[area];
  const transformations = [...placement.transformations];
  
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  const transformationString = transformations.join(',');
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
} 