'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import Script from 'next/script';

export interface CldMediaLibraryProps {
  onSelect: (publicId: string, url: string, metadata?: any) => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  allowTransformations?: boolean;
  supportedFileTypes?: ('image' | 'video' | 'raw' | 'auto')[];
  cloudName?: string;
}

export default function CldMediaLibrary({
  onSelect,
  buttonText = "Select from Media Library",
  variant = 'outline',
  size = 'default',
  className = '',
  allowTransformations = true,
  supportedFileTypes = ['image'],
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
}: CldMediaLibraryProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const openMediaLibrary = () => {
    if (!isScriptLoaded || !window.cloudinary) {
      console.warn("Cloudinary script not loaded yet");
      return;
    }

    setIsWidgetOpen(true);
    const mediaLibrary = window.cloudinary.createMediaLibrary(
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
          setIsWidgetOpen(false);
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
        closeHandler: () => {
          setIsWidgetOpen(false);
        }
      }
    );
    
    mediaLibrary.show();
  };

  return (
    <>
      <Script
        src="https://media-library.cloudinary.com/global/all.js"
        onLoad={() => setIsScriptLoaded(true)}
        strategy="lazyOnload"
      />
      <Button 
        onClick={openMediaLibrary} 
        variant={variant} 
        size={size} 
        className={className}
        disabled={!isScriptLoaded || isWidgetOpen}
      >
        <Image className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>
    </>
  );
} 