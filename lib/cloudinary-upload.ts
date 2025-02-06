import { ImageArea } from './cloudinary';

export async function uploadToCloudinary(
  file: File,
  area: ImageArea,
  section?: string,
  customFilename?: string
) {
  try {
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('file', file);
    formData.append('area', area);
    if (section) formData.append('section', section);
    if (customFilename) formData.append('customFilename', customFilename);

    const response = await fetch('/api/cloudinary', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Upload error response:', result);
      throw new Error(result.error || 'Upload failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

export async function deleteFromCloudinary(public_id: string) {
  try {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('public_id', public_id);

    const response = await fetch('/api/cloudinary', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      console.error('Delete error response:', result);
      throw new Error(result.error || 'Delete failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw error instanceof Error ? error : new Error('Delete failed');
  }
} 