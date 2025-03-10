'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { handleMediaUpload } from '@/app/admin/media/actions';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CldImage } from 'next-cloudinary';
import { Image as ImageIcon } from 'lucide-react';

// Upload preset is only used as a fallback if needed
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'emsculpt';

/**
 * Visual Media Manager
 * 
 * A simplified, intuitive interface for managing media on the site.
 * This component provides a WordPress-like experience for placing
 * images on the website without needing to write any code.
 * Uses signed uploads for Cloudinary to ensure secure media handling.
 */

// Type definitions
interface MediaPosition {
  id: string;
  name: string;
  description: string;
  currentImage?: string;
  section: string;
  page: string;
  mediaType?: 'image' | 'video';
}

interface PagePreview {
  id: string;
  name: string;
  path: string;
  preview: string;
  mediaPositions: MediaPosition[];
}

export default function VisualMediaManager() {
  // State
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [selectedPage, setSelectedPage] = useState<PagePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<MediaPosition | null>(null);
  
  // Load page data
  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        
        // Fetch page data from the API
        const response = await fetch('/api/visual-editor/pages');
        if (!response.ok) {
          throw new Error(`Failed to fetch page data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const fetchedPages = data.pages || [];
        
        setPages(fetchedPages);
        if (fetchedPages.length > 0) {
          setSelectedPage(fetchedPages[0]);
        }
      } catch (error) {
        console.error('Error loading page data:', error);
        setMessage({
          text: 'Failed to load page data. Please refresh the page or try again later.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPages();
  }, []);
  
  // Handle selecting a media position
  const handleSelectPosition = (position: MediaPosition) => {
    setSelectedPosition(position);
  };
  
  // Handle successful upload
  const handleUploadSuccess = async (positionId: string, result: any) => {
    try {
      console.log('Upload successful!', result);
      
      // Get the public ID from the result
      const publicId = result.info.public_id;
      
      // Update the media asset in the database
      await handleMediaUpload(positionId, publicId);
      
      // Update local state
      setPages(prevPages => {
        return prevPages.map(page => ({
          ...page,
          mediaPositions: page.mediaPositions.map(pos => 
            pos.id === positionId 
              ? { ...pos, currentImage: publicId }
              : pos
          )
        }));
      });
      
      if (selectedPage) {
        setSelectedPage({
          ...selectedPage,
          mediaPositions: selectedPage.mediaPositions.map(pos => 
            pos.id === positionId 
              ? { ...pos, currentImage: publicId }
              : pos
          )
        });
      }
      
      setMessage({
        text: 'Image uploaded successfully!',
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error handling upload:', error);
      setMessage({
        text: 'Failed to save your image. Please try again.',
        type: 'error'
      });
    }
  };
  
  // Render page selector
  const renderPageSelector = () => (
    <div className="page-selector mb-6">
      <h2 className="text-lg font-semibold mb-2">Select a Page</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {pages.map(page => (
          <div 
            key={page.id}
            className={`page-card cursor-pointer border rounded-lg p-2 ${selectedPage?.id === page.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
            onClick={() => setSelectedPage(page)}
          >
            <div className="h-24 bg-gray-100 dark:bg-gray-800 relative mb-2 rounded overflow-hidden">
              {page.preview ? (
                <Image 
                  src={page.preview} 
                  alt={page.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">{page.name}</span>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-center">{page.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render function for media items based on type
  const renderMediaPreview = (position: MediaPosition) => {
    const mediaType = position.mediaType || 'image';
    
    if (mediaType === 'video' && position.currentImage) {
      return (
        <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden">
          <video 
            src={getCloudinaryUrl(position.currentImage, { resource_type: 'video' })}
            className="w-full h-full object-cover" 
            controls
            muted
            poster={getCloudinaryUrl(position.currentImage, { 
              resource_type: 'video',
              format: 'jpg'
            })}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }
    
    // Default to image rendering
    return position.currentImage ? (
      <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden">
        <CldImage
          src={position.currentImage}
          width={320}
          height={180}
          className="w-full h-full object-cover"
          alt={position.name}
          onError={(e) => {
            console.warn(`Failed to load image: ${position.currentImage}`);
            // Replace with fallback image or placeholder
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite error loop
            target.src = '/placeholder-image.jpg'; // Use a local placeholder image
          }}
        />
      </div>
    ) : (
      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-md">
        <div className="text-center p-4">
          <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No image selected</p>
          <p className="text-xs text-gray-400">Click the "Add Image" button to upload</p>
        </div>
      </div>
    );
  };
  
  // Render visual editor
  const renderVisualEditor = () => {
    if (!selectedPage) return null;
    
    return (
      <div className="visual-editor border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="editor-header bg-gray-100 dark:bg-gray-800 p-3 border-b dark:border-gray-700">
          <h2 className="font-semibold">{selectedPage.name} <span className="text-sm font-normal text-gray-500">{selectedPage.path}</span></h2>
        </div>
        
        <div className="editor-canvas p-4 bg-white dark:bg-gray-900 min-h-[400px]">
          {selectedPage.mediaPositions.map(position => (
            <div 
              key={position.id}
              className={`media-position border-2 rounded-lg p-3 mb-4 ${
                selectedPosition?.id === position.id ? 
                'border-blue-500' : 
                position.currentImage ? 'border-green-500' : 'border-gray-300 dark:border-gray-700 border-dashed'
              }`}
              onClick={() => handleSelectPosition(position)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{position.name}</h3>
                  <p className="text-sm text-gray-500">{position.description}</p>
                </div>
                
                <CloudinaryUploader
                  useUploadPreset={false}
                  area={position.section as any}
                  folder={`site/${position.section}`}
                  buttonLabel={position.currentImage ? 'Replace' : 'Add Image'}
                  buttonClassName="py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                  cropping={true}
                  onSuccess={(result) => {
                    if (result && 'publicId' in result) {
                      handleUploadSuccess(position.id, { event: 'success', info: { public_id: result.publicId } });
                    }
                  }}
                  onFailure={(error) => {
                    console.error('Upload error:', error);
                    setMessage({
                      text: `Upload failed: ${error.message || 'Unknown error'}`,
                      type: 'error'
                    });
                  }}
                />
              </div>
              
              <div className={`media-preview mt-3 bg-gray-100 dark:bg-gray-800 rounded ${!position.currentImage ? 'h-32 flex items-center justify-center' : ''}`}>
                {renderMediaPreview(position)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render loading state
  if (loading) {
    return <div className="p-8 text-center">Loading page data...</div>;
  }
  
  return (
    <div className="visual-media-manager p-4">
      <h1 className="text-2xl font-bold mb-6">Visual Media Manager</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}
      
      {renderPageSelector()}
      {renderVisualEditor()}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Need help? This visual editor allows you to easily place images on your website without writing any code.</p>
        <p className="mt-1">Simply select a page, choose a media position, and click the "Add Image" button to upload an image.</p>
      </div>
    </div>
  );
} 