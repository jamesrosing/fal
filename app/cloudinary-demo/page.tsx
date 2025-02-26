'use client';

import { useState } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryVideo } from '@/components/CloudinaryVideo';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CloudinaryAsset } from '@/lib/cloudinary';

/**
 * Cloudinary Demo Page
 * 
 * A comprehensive demonstration of our Cloudinary components and utilities
 */
export default function CloudinaryDemoPage() {
  const [uploadedAsset, setUploadedAsset] = useState<CloudinaryAsset | null>(null);
  
  const handleUploadSuccess = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    console.log('Upload successful:', result);
    // If result is an array, take the first asset
    const asset = Array.isArray(result) ? result[0] : result;
    setUploadedAsset(asset);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Cloudinary Integration Demo</h1>
        <p className="text-xl text-gray-600">
          A showcase of our unified Cloudinary components and utilities
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">CloudinaryImage Component</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic usage */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Basic Usage</h3>
            <CloudinaryImage 
              publicId="samples/landscapes/nature-mountains" 
              alt="Mountain landscape" 
              className="w-full rounded-lg"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryImage 
  publicId="samples/landscapes/nature-mountains" 
  alt="Mountain landscape" 
/>`}
            </pre>
          </div>

          {/* With image area */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Using Image Area</h3>
            <CloudinaryImage 
              publicId="samples/people/smiling-man" 
              area="team"
              alt="Team member" 
              className="w-full rounded-lg"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryImage 
  publicId="samples/people/smiling-man" 
  area="team"
  alt="Team member" 
/>`}
            </pre>
          </div>

          {/* With custom options */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Custom Options</h3>
            <CloudinaryImage 
              publicId="samples/animals/cat" 
              alt="Cat"
              options={{ 
                width: 300, 
                height: 300, 
                crop: 'fill',
                gravity: 'face'
              }}
              expandOnHover
              className="w-full rounded-lg"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryImage 
  publicId="samples/animals/cat" 
  alt="Cat"
  options={{ 
    width: 300, 
    height: 300, 
    crop: 'fill',
    gravity: 'face'
  }}
  expandOnHover
/>`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">CloudinaryVideo Component</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic video */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Basic Usage</h3>
            <CloudinaryVideo 
              publicId="samples/elephants" 
              className="w-full rounded-lg"
              controls
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryVideo 
  publicId="samples/elephants" 
  controls
/>`}
            </pre>
          </div>

          {/* Advanced video options */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Advanced Options</h3>
            <CloudinaryVideo 
              publicId="samples/sea-turtle" 
              options={{ width: 640 }}
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-lg"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryVideo 
  publicId="samples/sea-turtle" 
  options={{ width: 640 }}
  autoPlay
  loop
  muted
  playsInline
/>`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">CloudinaryUploader Component</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic uploader */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Basic Uploader</h3>
            <CloudinaryUploader 
              onSuccess={handleUploadSuccess}
              buttonLabel="Upload an Image"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryUploader 
  onSuccess={handleUploadSuccess}
  buttonLabel="Upload an Image"
/>`}
            </pre>
          </div>

          {/* Advanced uploader */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Advanced Uploader</h3>
            <CloudinaryUploader 
              area="team"
              folder="team/headshots"
              tags={["demo", "team"]}
              cropping={true}
              croppingAspectRatio={3/4}
              onSuccess={handleUploadSuccess}
              buttonLabel="Upload Team Photo"
              buttonClassName="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            />
            <pre className="mt-4 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {`<CloudinaryUploader 
  area="team"
  folder="team/headshots"
  tags={["demo", "team"]}
  cropping={true}
  croppingAspectRatio={3/4}
  onSuccess={handleUploadSuccess}
  buttonLabel="Upload Team Photo"
  buttonClassName="custom-class"
/>`}
            </pre>
          </div>
        </div>
      </section>

      {uploadedAsset && (
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Recently Uploaded Asset</h2>
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">Uploaded Asset Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <CloudinaryImage 
                  publicId={uploadedAsset.publicId} 
                  alt="Uploaded image" 
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <h4 className="font-medium mb-2">Asset Information</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(uploadedAsset, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mt-16 pt-8 border-t text-center text-gray-500">
        <p>
          View the full documentation in{" "}
          <a href="/docs/cloudinary-usage.md" className="text-blue-600 hover:underline">
            docs/cloudinary-usage.md
          </a>
        </p>
      </footer>
    </div>
  );
} 