'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import Script from 'next/script';
// import OptimizedImage from '@/components/media/OptimizedImage';
// import OptimizedVideo from '@/components/media/OptimizedVideo';


export interface CloudinaryMediaLibraryProps {
  onSelect: (publicId: string, url: string, metadata?: any) => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  allowTransformations?: boolean;
  supportedFileTypes?: ('image' | 'video' | 'raw' | 'auto')[];
  onError?: (error: Error) => void;
  cloudName?: string;
}

export default function CloudinaryMediaLibrary({
  onSelect,
  buttonText = "Select from Media Library",
  variant = 'outline',
  size = 'default',
  className = '',
  allowTransformations = true,
  supportedFileTypes = ['image'],
  onError,
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
}: CloudinaryMediaLibraryProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [cloudinaryWidget, setCloudinaryWidget] = useState<any>(null);

  // Handle Cloudinary script loading
  const handleScriptLoad = () => {
    setIsScriptLoaded(true);
  };

  // Initialize the Cloudinary Media Library widget when the script loads
  useEffect(() => {
    if (!isScriptLoaded || cloudinaryWidget) return;
    
    // Check if cloudinary is available in window
    if (typeof window === 'undefined' || !(window as any).cloudinary) return;

    try {
      const cloudinary = (window as any).cloudinary;
      const widget = cloudinary.createMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          remove_header: false,
          max_files: 1,
          multiple: false,
          insert_caption: 'Select',
          default_transformations: [[]],
          inline_container: null,
          transformation_options: allowTransformations,
          resource_type: supportedFileTypes.includes('auto') ? 'auto' : supportedFileTypes[0],
        },
        {
          insertHandler: (data: any) => {
            if (data.assets && data.assets.length > 0) {
              const asset = data.assets[0];
              onSelect(
                asset.public_id, 
                asset.secure_url, 
                {
                  width: asset.width,
                  height: asset.height,
                  format: asset.format,
                  resourceType: asset.resource_type,
                  tags: asset.tags,
                  context: asset.context,
                  transformation: data.transformations || []
                }
              );
            }
          },
        }
      );
      
      setCloudinaryWidget(widget);
    } catch (error) {
      console.error('Error initializing Cloudinary Media Library:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [isScriptLoaded, cloudName, onSelect, onError, allowTransformations, supportedFileTypes, cloudinaryWidget]);

  // Handle opening the Media Library
  const openMediaLibrary = () => {
    if (!isScriptLoaded) {
      console.warn('Cloudinary script not yet loaded');
      return;
    }

    if (!cloudinaryWidget) {
      console.error('Cloudinary widget not initialized');
      return;
    }

    try {
      cloudinaryWidget.show();
    } catch (error) {
      console.error('Error opening Cloudinary Media Library:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return (
    <>
      <Script
        src="https://media-library.cloudinary.com/global/all.js"
        onLoad={handleScriptLoad}
        strategy="lazyOnload"
      />
      <Button 
        onClick={openMediaLibrary} 
        variant={variant} 
        size={size} 
        className={className}
      >
        <Image className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </>
  );
} 