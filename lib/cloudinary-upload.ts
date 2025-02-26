/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the unified Cloudinary module from '@/lib/cloudinary' instead.
 * It provides all the same functionality with improved typings and organization.
 */

'use client';

import { ImageArea } from '@/lib/cloudinary-client';

/**
 * Client-side function for uploading files to Cloudinary via the /api/upload endpoint
 */
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

/**
 * Client-side function for deleting files from Cloudinary
 */
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