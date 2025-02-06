import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not defined');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not defined');
}

if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not defined');
}

function generateSignature(params: Record<string, any>) {
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
  const stringToSign = sortedParams + process.env.CLOUDINARY_API_SECRET;
  
  console.log('String to sign:', stringToSign);

  // Generate SHA-256 hash
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
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

      // Generate folder path and public_id separately
      let folder = placement.path;
      if (section) {
        folder += `/${section}`;
      }

      // Generate a clean filename for the public_id
      const public_id = customFilename 
        ? customFilename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Convert File to ArrayBuffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

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
        context,
        tags: tags.join(','),
        transformation: transformation || undefined,
        upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      };

      // Generate signature
      const signature = generateSignature(paramsToSign);

      // Create form data for Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', new Blob([buffer]));
      uploadFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
      uploadFormData.append('timestamp', timestamp);
      uploadFormData.append('signature', signature);
      uploadFormData.append('folder', folder);
      uploadFormData.append('public_id', public_id);
      uploadFormData.append('tags', tags.join(','));
      uploadFormData.append('context', JSON.stringify(context));
      uploadFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

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
        upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      });

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
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

      const signature = generateSignature(paramsToSign);

      const deleteFormData = new FormData();
      deleteFormData.append('public_id', public_id);
      deleteFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
      deleteFormData.append('timestamp', timestamp);
      deleteFormData.append('signature', signature);

      const deleteResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
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