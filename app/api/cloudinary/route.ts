import { NextResponse } from 'next/server';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

export const runtime = 'edge';

// @deprecated Use /api/upload instead. This route will be removed in a future version.
// The /api/upload route provides the same functionality with Edge runtime support.

// Environment variable validation
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not defined');
}

if (!CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not defined');
}

if (!CLOUDINARY_UPLOAD_PRESET) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not defined');
}

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
}

async function generateSignature(params: Record<string, any>) {
  // Create a copy of params without undefined values and convert objects to strings
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'object' ? JSON.stringify(value) : value;
      return acc;
    }, {} as Record<string, string>);

  // Sort parameters alphabetically
  const sortedParams = Object.keys(cleanParams)
    .sort()
    .map(key => `${key}=${cleanParams[key]}`)
    .join('&');

  // Append API secret
  const stringToSign = sortedParams + CLOUDINARY_API_SECRET;
  
  console.log('String to sign:', stringToSign);

  // Use Web Crypto API which is available in Edge Runtime
  const msgUint8 = new TextEncoder().encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  
  // Convert hash to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    if (action === 'upload') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const area = formData.get('area') as ImageArea;
      const section = formData.get('section') as string;
      const customFilename = formData.get('customFilename') as string;

      const placement = IMAGE_PLACEMENTS[area];
      if (!placement) {
        return NextResponse.json({ error: 'Invalid image area' }, { status: 400 });
      }

      // Generate folder path - use only the placement path
      const folder = placement.path;

      // Generate a clean filename for the public_id
      const public_id = customFilename 
        ? customFilename.toLowerCase()
            .replace(/\.[^/.]+$/, '') // Remove file extension
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : file.name.toLowerCase()
            .replace(/\.[^/.]+$/, '') // Remove file extension
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

      // Convert File to ArrayBuffer (not needed for Edge, we can pass File directly)
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const tags = [area, section].filter(Boolean);
      const context = {
        area: area,
        section: section || '',
        dimensions: `${placement.dimensions.width}x${placement.dimensions.height}`,
        aspect_ratio: placement.dimensions.aspectRatio.toString()
      };

      // Combine all transformations into a single string
      const transformation = placement.transformations.join(',');

      // Parameters for signature - include ALL parameters that will be sent
      const paramsToSign = {
        timestamp,
        folder,
        public_id,
        context: JSON.stringify(context),
        tags: tags.join(','),
        transformation: transformation || undefined,
        upload_preset: CLOUDINARY_UPLOAD_PRESET
      };

      // Generate signature
      const signature = await generateSignature(paramsToSign);

      // Create form data for Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', file); // Now we can directly use the File object
      uploadFormData.append('api_key', CLOUDINARY_API_KEY as string);
      uploadFormData.append('timestamp', timestamp);
      uploadFormData.append('signature', signature);
      uploadFormData.append('folder', folder);
      uploadFormData.append('public_id', public_id);
      uploadFormData.append('tags', tags.join(','));
      uploadFormData.append('context', JSON.stringify(context));
      uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);

      // Add transformation if exists
      if (transformation) {
        uploadFormData.append('transformation', transformation);
      }

      console.log('Uploading to Cloudinary with params:', {
        folder,
        public_id,
        timestamp,
        signature: signature.slice(0, 10) + '...',
        transformation,
        upload_preset: CLOUDINARY_UPLOAD_PRESET
      });

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      );

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error('Cloudinary upload error:', result);
        return NextResponse.json({ 
          error: result.error?.message || result.error || 'Upload failed',
          details: result
        }, { status: uploadResponse.status });
      }

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
    } 
    else if (action === 'delete') {
      const public_id = formData.get('public_id') as string;
      if (!public_id) {
        return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
      }

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const paramsToSign = {
        public_id,
        timestamp
      };

      const signature = await generateSignature(paramsToSign);

      const deleteFormData = new FormData();
      deleteFormData.append('public_id', public_id);
      deleteFormData.append('api_key', CLOUDINARY_API_KEY as string);
      deleteFormData.append('timestamp', timestamp);
      deleteFormData.append('signature', signature);

      const deleteResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: 'POST',
          body: deleteFormData,
        }
      );

      const result = await deleteResponse.json();

      if (!deleteResponse.ok) {
        console.error('Cloudinary delete error:', result);
        return NextResponse.json({ 
          error: result.error?.message || result.error || 'Delete failed',
          details: result
        }, { status: deleteResponse.status });
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Cloudinary operation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Operation failed',
        details: error
      }, 
      { status: 500 }
    );
  }
} 