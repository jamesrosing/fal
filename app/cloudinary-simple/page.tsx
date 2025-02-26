'use client';

import { useState } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CloudinaryAsset } from '@/lib/cloudinary';

export default function CloudinarySimplePage() {
  const [uploadedAsset, setUploadedAsset] = useState<CloudinaryAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleUploadSuccess = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    console.log('Upload success:', result);
    const asset = Array.isArray(result) ? result[0] : result;
    setUploadedAsset(asset);
    setErrorMessage(null);
  };
  
  const handleUploadFailure = (error: any) => {
    console.error('Upload failure:', error);
    setErrorMessage(typeof error === 'string' ? error : JSON.stringify(error));
  };
  
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Upload Test</h1>
      
      <div className="mb-8 p-4 bg-amber-50 border-amber-200 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-amber-800">About Cloudinary Upload Modes</h2>
        <p className="mb-4 text-amber-700">There are two ways to upload to Cloudinary:</p>
        
        <ol className="list-decimal pl-5 mb-4 text-amber-700 space-y-2">
          <li>
            <strong>Unsigned Uploads with Preset</strong>: Requires whitelisting your upload preset in the Cloudinary dashboard. 
            Error "Upload preset must be whitelisted for unsigned uploads" means your preset isn't configured for unsigned uploads.
          </li>
          <li>
            <strong>Signed Uploads (This Demo)</strong>: Uses server-side authentication which is more secure and doesn't require preset configuration.
          </li>
        </ol>
        
        <p className="text-amber-700">This demo uses signed uploads, which should work without needing to whitelist a preset.</p>
      </div>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Cloudinary Upload Test</h2>
        <p className="mb-4">This page demonstrates uploading to Cloudinary using server-side authentication (signed uploads).</p>
        
        <div className="mb-4">
          <strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}
        </div>
        
        <CloudinaryUploader 
          onSuccess={handleUploadSuccess}
          onFailure={handleUploadFailure}
          buttonLabel="Upload Image (Signed Upload)"
          useUploadPreset={false}
          area="gallery"
        />
        <p className="mt-2 text-sm text-gray-500">
          Using signed uploads with server-side authentication
        </p>
      </div>
      
      {errorMessage && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Upload Error</h3>
          <pre className="bg-red-100 p-3 rounded text-sm text-red-900 overflow-auto">
            {errorMessage}
          </pre>
          
          <div className="mt-4 p-3 bg-white rounded">
            <p className="font-medium">Troubleshooting:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Check browser console for detailed error logs</li>
              <li>Verify that your CLOUDINARY_API_SECRET is properly set in environment variables</li>
              <li>Verify that your CLOUDINARY_API_KEY is properly set in environment variables</li>
              <li>Verify that your NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is correct</li>
            </ul>
          </div>
        </div>
      )}
      
      {uploadedAsset && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Upload Successful</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {uploadedAsset.resourceType === 'image' && (
                <CloudinaryImage 
                  publicId={uploadedAsset.publicId} 
                  alt="Uploaded image"
                  options={{ width: 400 }}
                />
              )}
            </div>
            <div>
              <pre className="bg-green-100 p-3 rounded text-sm text-green-900 overflow-auto">
                {JSON.stringify(uploadedAsset, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 