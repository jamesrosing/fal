'use client';

import { useState } from 'react';
import { CldImageWrapper } from '@/components/media/CldImageWrapper';
import { CldVideoWrapper } from '@/components/media/CldVideoWrapper';
import { CldUploadWidgetWrapper } from '@/components/media/CldUploadWidget';
import CldMediaLibrary from '@/components/media/CldMediaLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function CloudinaryExample() {
  const [uploadedImage, setUploadedImage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState('');
  
  const handleUpload = (result: any) => {
    console.log('Uploaded media:', result);
    if (result.info?.public_id) {
      setUploadedImage(result.info.public_id);
    }
  };
  
  const handleMediaSelect = (publicId: string, url: string, metadata?: any) => {
    console.log('Selected media:', { publicId, url, metadata });
    setSelectedMedia(publicId);
  };
  
  return (
    <div className="space-y-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Environment Setup Required</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            To use these components, make sure your Cloudinary environment variables are correctly set in your <code className="bg-gray-100 px-1 rounded">.env</code> file:
          </p>
          <ul className="list-disc list-inside ml-2 text-sm">
            <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</li>
            <li>CLOUDINARY_API_KEY</li>
            <li>CLOUDINARY_API_SECRET</li>
            <li>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</li>
          </ul>
          <p className="text-sm">
            Visit the <a href="/api/cloudinary/diagnostic" target="_blank" className="underline">diagnostic page</a> to verify your configuration.
          </p>
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>CldImageWrapper Component</CardTitle>
          <CardDescription>Displays images from Cloudinary with responsive behavior and optional area presets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col items-center">
              <p className="mb-2">Basic Image:</p>
              <CldImageWrapper
                publicId="placeholder"
                alt="Placeholder Image"
                width={300}
                height={200}
                className="rounded shadow-md"
                fallbacksrc="images/global/icons/image-placeholder.svg"
              />
              <code className="mt-2 text-xs bg-gray-100 p-1 rounded">placeholder</code>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>CldVideoWrapper Component</CardTitle>
          <CardDescription>Displays videos from Cloudinary with customizable player settings</CardDescription>
        </CardHeader>
        <CardContent>
          <CldVideoWrapper
            publicId="placeholder-video"
            width={640}
            height={360}
            controls={true}
            fallbacksrc="images/global/icons/video-placeholder.svg"
          />
          <code className="mt-2 text-xs bg-gray-100 p-1 rounded">placeholder-video</code>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload & Media Library Components</CardTitle>
          <CardDescription>Allows users to upload new media or select from the media library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Widget</h3>
              <CldUploadWidgetWrapper
                onUpload={handleUpload}
                buttonText="Upload Image"
                options={{
                  sources: ['local', 'url', 'camera'],
                  folder: 'examples/upload-widget',
                  tags: ['example', 'upload-widget'],
                }}
              />
              
              {uploadedImage && (
                <div className="mt-4">
                  <p className="mb-2">Uploaded Image:</p>
                  <CldImageWrapper
                    publicId={uploadedImage}
                    alt="Uploaded image"
                    width={300}
                    height={200}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Media Library</h3>
              <CldMediaLibrary
                onSelect={handleMediaSelect}
                buttonText="Select from Media Library"
              />
              
              {selectedMedia && (
                <div className="mt-4">
                  <p className="mb-2">Selected Media:</p>
                  <CldImageWrapper
                    publicId={selectedMedia}
                    alt="Selected media"
                    width={300}
                    height={200}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
