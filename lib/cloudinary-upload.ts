import { ImageArea, IMAGE_PLACEMENTS } from './cloudinary';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
}

if (!UPLOAD_PRESET) {
  throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not defined');
}

export async function uploadToCloudinary(
  file: File,
  area: ImageArea,
  section?: string,
  customFilename?: string
) {
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
    const cleanFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    public_id += `/${cleanFilename}`;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', placement.path);
  formData.append('public_id', public_id);
  
  // Add transformation parameters
  placement.transformations.forEach(transform => {
    formData.append('transformation', transform);
  });

  // Add tags and context
  formData.append('tags', [area, section].filter(Boolean).join(','));
  formData.append('context', JSON.stringify({
    area: area,
    section: section || "",
    dimensions: `${placement.dimensions.width}x${placement.dimensions.height}`,
    aspect_ratio: placement.dimensions.aspectRatio.toString()
  }));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const result = await response.json();
  return {
    success: true,
    url: result.secure_url,
    public_id: result.public_id,
    metadata: {
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type
    }
  };
} 