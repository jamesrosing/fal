'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function CloudinaryDebugPage() {
  const [publicId, setPublicId] = useState('gallery/ssoojur3zlvn2wlewejx');
  const [width, setWidth] = useState(400);
  const [cloudName, setCloudName] = useState(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w');
  const [showImages, setShowImages] = useState(false);

  // Test various URL patterns
  const urlFormats = [
    {
      name: 'Base URL (no transformations)',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
    },
    {
      name: 'Simple width transformation',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/w_${width}/${publicId}`
    },
    {
      name: 'Width and format auto',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},f_auto/${publicId}`
    },
    {
      name: 'Width, format and quality auto',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},f_auto,q_auto/${publicId}`
    },
    {
      name: 'Scale crop with width',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},c_scale/${publicId}`
    },
    {
      name: 'Full transformations',
      url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width},c_scale,g_auto/${publicId}`
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Cloudinary URL Debug</h1>
      <p className="mb-6 text-gray-600">
        This page helps identify which Cloudinary URL formats work with your setup.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-2 font-medium">Public ID</label>
          <Input 
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            placeholder="Enter public ID (e.g., folder/image_id)"
            className="mb-4"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Cloud Name</label>
          <Input 
            value={cloudName}
            onChange={(e) => setCloudName(e.target.value)}
            placeholder="Enter your Cloudinary cloud name"
            className="mb-4"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Width</label>
          <Input 
            type="number"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            placeholder="Image width in pixels"
            className="mb-4"
          />
        </div>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => setShowImages(!showImages)}
          className="w-full"
        >
          {showImages ? 'Hide Images' : 'Test URLs & Show Images'}
        </Button>
      </div>

      {showImages && (
        <div className="space-y-8">
          {urlFormats.map((format, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{format.name}</h2>
              <p className="text-sm text-gray-500 break-all mb-4">{format.url}</p>
              
              <div className="aspect-w-4 aspect-h-3 relative w-full h-64 bg-gray-100 rounded">
                <img
                  src={format.url}
                  alt={`Test image ${index + 1}`}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAxNkM2LjQgMTYgNC45IDE1LjYgMy42IDE0LjlDMi4zIDE0LjIgMS4yIDEzLjIgMC41IDEyQy0wLjIgMTAuNyAtMC4yIDkuMiAwLjUgNy45QzEuMiA2LjYgMi4zIDUuNiAzLjYgNC45QzQuOSA0LjIgNi40IDMuOSA4IDMuOUMxMC40IDMuOSAxMi42IDQuOSAxNCA2LjZMMTIuNyA3LjlDMTEuNiA2LjYgOS45IDUuOSA4IDUuOUM2LjQgNS45IDQuOSA2LjYgMy44IDcuOUMyLjcgOS4yIDIuNCAxMC43IDIuNyAxMi4xQzMuMSAxMy41IDQuMSAxNC42IDUuNSAxNS4yQzYuOSAxNS45IDguNSAxNS45IDEwIDE1LjNDMTEuNCAxNC43IDEyLjUgMTMuNiAxMi45IDEyLjJIMTBWMTAuMkgxNlYxNi4ySDEzLjlWMTQuMkMxMi44IDE0LjkgMTEuNiAxNS4zIDEwLjIgMTUuNkM5LjQgMTUuOSA4LjcgMTYgOCAxNloiIGZpbGw9IiNmOTdmNmIiLz48cGF0aCBkPSJNOCAwVjJDOS4yIDIgMTAuMyAyLjQgMTEuMiAzLjJDMTIuMSA0IDEyLjYgNS4xIDEyLjYgNi4zQzEyLjYgNy41IDEyLjEgOC42IDExLjIgOS40QzEwLjMgMTAuMiA5LjIgMTAuNiA4IDEwLjZWMTUuOUM5LjMgMTUuOSAxMC42IDE1LjYgMTEuOCAxNC45QzEzIDU0IDEzLjkgMTMuNSAxNC41IDEyLjNDMTUuMSAxMS4xIDE1LjMgOS44IDE1LjIgOC41QzE1IDcuMiAxNC41IDYgMTMuNyA1QzEyLjkgNCAxMS45IDMuMiAxMC43IDIuNkM5LjkgMi4xIDkgMiA4IDBaIiBmaWxsPSIjMDBhZGZmIi8+PC9zdmc+';
                    target.parentElement!.classList.add('bg-red-50');
                    const errorText = document.createElement('div');
                    errorText.className = 'absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-xs';
                    errorText.textContent = 'Failed to load image';
                    target.parentElement!.appendChild(errorText);
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.classList.remove('bg-red-50');
                    target.parentElement!.classList.add('bg-green-50');
                    // Clear any error messages
                    const errorText = target.parentElement!.querySelector('div');
                    if (errorText) {
                      errorText.remove();
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 