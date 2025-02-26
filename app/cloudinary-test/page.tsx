'use client';

import { useState } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CloudinaryAsset } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CloudinaryTestPage() {
  const [uploadedAsset, setUploadedAsset] = useState<CloudinaryAsset | null>(null);
  const [lastError, setLastError] = useState<any>(null);
  const [uploadMethod, setUploadMethod] = useState<string>('signed');

  const handleUploadSuccess = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    console.log('Upload success:', result);
    const asset = Array.isArray(result) ? result[0] : result;
    setUploadedAsset(asset);
    setLastError(null);
  };

  const handleUploadFailure = (error: any) => {
    console.error('Upload failed:', error);
    setLastError(error);
  };

  const handleDirectUpload = async () => {
    console.log('Environment variables:', {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Upload Test</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p>Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing'}</p>
              <p>Upload Preset: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅ Configured' : '❌ Missing'}</p>
              <p>Upload Preset Name: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not available'}</p>
              <Button onClick={handleDirectUpload} className="mt-4">Log Environment Info</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signed" className="mb-10" onValueChange={setUploadMethod}>
        <TabsList>
          <TabsTrigger value="signed">Signed Upload (Recommended)</TabsTrigger>
          <TabsTrigger value="unsigned">Unsigned Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signed">
          <Card>
            <CardHeader>
              <CardTitle>Signed Upload (Server Authentication)</CardTitle>
              <CardDescription>
                Uses server-side authentication with API secret. Most secure approach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CloudinaryUploader
                onSuccess={handleUploadSuccess}
                onFailure={handleUploadFailure}
                buttonLabel="Upload with Server Signature"
                useUploadPreset={false}
                area="gallery"
                description="This uploader uses server-side signature generation for secure uploads"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unsigned">
          <Card>
            <CardHeader>
              <CardTitle>Unsigned Upload with Preset</CardTitle>
              <CardDescription>
                Uses a upload preset that must be <strong>whitelisted for unsigned uploads</strong> in your Cloudinary dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CloudinaryUploader
                onSuccess={handleUploadSuccess}
                onFailure={handleUploadFailure}
                buttonLabel="Upload with Preset"
                useUploadPreset={true}
                uploadPreset="emsculpt"
                description="This uploader uses the 'emsculpt' upload preset which must be whitelisted for unsigned uploads"
              />
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
                <strong>Note:</strong> For this to work, you need to whitelist your preset for unsigned uploads in the Cloudinary dashboard:
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Go to Cloudinary Dashboard</li>
                  <li>Navigate to Settings &gt; Upload</li>
                  <li>Find your "emsculpt" preset (or create it)</li>
                  <li>Edit the preset and set "Signing Mode" to "Unsigned"</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Upload Error</h3>
          <pre className="bg-red-100 p-3 rounded text-sm text-red-900 overflow-auto">
            {typeof lastError === 'object' 
              ? JSON.stringify(lastError, null, 2) 
              : String(lastError)}
          </pre>
        </div>
      )}

      {uploadedAsset && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Successfully Uploaded Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Asset Preview</h4>
              <div className="border rounded-md overflow-hidden">
                {uploadedAsset.resourceType === 'image' ? (
                  <CloudinaryImage 
                    publicId={uploadedAsset.publicId} 
                    alt="Uploaded image" 
                    options={{ width: 400 }}
                  />
                ) : (
                  <div className="p-4 bg-gray-100 text-center">
                    Non-image asset (video or raw file)
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Asset Details</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(uploadedAsset, null, 2)}
              </pre>
              <p className="mt-2 text-sm text-gray-600">
                Upload method: <span className="font-semibold">{uploadMethod}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 