'use client';

import { useState } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CloudinaryAsset } from '@/lib/cloudinary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CloudinarySimplePage() {
  const [uploadedAsset, setUploadedAsset] = useState<CloudinaryAsset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadMethod, setUploadMethod] = useState<string>('signed');
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`]);
    console.log(message);
  };
  
  const handleUploadSuccess = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    addLog('Upload success: ' + JSON.stringify(result, null, 2));
    const asset = Array.isArray(result) ? result[0] : result;
    setUploadedAsset(asset);
    setErrorMessage(null);
  };
  
  const handleUploadFailure = (error: any) => {
    addLog('Upload failure: ' + JSON.stringify(error, null, 2));
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
        
        <p className="text-amber-700">This demo provides both methods to help you troubleshoot.</p>
      </div>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <div className="mb-4">
          <strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}
          <br />
          <strong>Environment Check:</strong>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✓' : '✗'}<br />
            NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✓' : '✗'}
          </pre>
        </div>
      </div>
      
      <Tabs defaultValue="signed" className="mb-8" onValueChange={setUploadMethod}>
        <TabsList className="mb-4">
          <TabsTrigger value="signed">Signed Upload</TabsTrigger>
          <TabsTrigger value="preset">Preset Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signed" className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Signed Upload (Server Authentication)</h3>
          <p className="mb-4">This uses server-side authentication with your Cloudinary API secret.</p>
          
          <CloudinaryUploader 
            onSuccess={handleUploadSuccess}
            onFailure={handleUploadFailure}
            buttonLabel="Upload Image (Signed)"
            useUploadPreset={false}
            area="gallery"
          />
        </TabsContent>
        
        <TabsContent value="preset" className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Preset Upload (Client Authentication)</h3>
          <p className="mb-4">This uses an upload preset that should be whitelisted for unsigned uploads.</p>
          
          <CloudinaryUploader 
            onSuccess={handleUploadSuccess}
            onFailure={handleUploadFailure}
            buttonLabel="Upload Image (Using Preset)"
            useUploadPreset={true}
            uploadPreset="emsculpt"
            area="gallery"
          />
          
          <p className="mt-2 text-sm text-amber-600">
            Note: For this to work, "emsculpt" preset must be configured for unsigned uploads in your Cloudinary dashboard.
          </p>
        </TabsContent>
      </Tabs>
      
      {logs.length > 0 && (
        <div className="mb-8 p-4 bg-gray-800 text-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Debug Logs</h3>
          <div className="text-xs font-mono h-40 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="py-1 border-b border-gray-700">{log}</div>
            ))}
          </div>
        </div>
      )}
      
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
              <li>For preset upload: Make sure your upload preset is whitelisted for unsigned uploads</li>
            </ul>
          </div>
        </div>
      )}
      
      {uploadedAsset && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Upload Successful</h3>
          <p className="mb-2">Using method: <strong>{uploadMethod}</strong></p>
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