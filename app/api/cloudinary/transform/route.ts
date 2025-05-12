import { NextRequest, NextResponse } from 'next/server';
import { 
  getCloudinaryUrl, 
  getCloudinaryVideoUrl,
  getMediaType 
} from '@/lib/cloudinary';

/**
 * API route for transforming Cloudinary assets
 * POST /api/cloudinary/transform
 * 
 * Request body:
 * {
 *   publicId: string;       // Cloudinary public_id
 *   transformations: {      // Transformation options
 *     width?: number;       // Width in pixels
 *     height?: number;      // Height in pixels
 *     crop?: string;        // Crop mode (fill, crop, scale, etc.)
 *     gravity?: string;     // Gravity for cropping (auto, face, center, etc.)
 *     quality?: number;     // Quality (1-100)
 *     format?: string;      // Output format (auto, webp, jpg, etc.)
 *     effect?: string;      // Effects to apply
 *     blur?: number;        // Blur amount
 *     background?: string;  // Background color
 *     overlay?: string;     // Overlay text or image
 *     angle?: number;       // Rotation angle
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId, transformations = {} } = body;
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId parameter' },
        { status: 400 }
      );
    }
    
    const mediaType = getMediaType(publicId);
    const isVideo = mediaType === 'video';
    
    let url;
    
    if (isVideo) {
      url = getCloudinaryVideoUrl(publicId, {
        width: transformations.width,
        format: transformations.format || 'mp4',
        quality: transformations.quality
      });
    } else {
      url = getCloudinaryUrl(publicId, transformations);
    }
    
    return NextResponse.json({
      url,
      publicId,
      transformations,
      mediaType
    });
  } catch (error) {
    console.error('Error transforming Cloudinary asset:', error);
    return NextResponse.json(
      { error: 'Failed to transform Cloudinary asset' },
      { status: 500 }
    );
  }
}