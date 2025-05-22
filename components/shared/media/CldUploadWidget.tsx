'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/shared/ui/button';
import { Image } from 'lucide-react';
import { useState } from 'react';

export interface CldUploadWidgetWrapperProps {
  onUpload: (result: any) => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  options?: Record<string, any>;
  uploadPreset?: string;
}

export function CldUploadWidgetWrapper({
  onUpload,
  buttonText = "Upload Media",
  variant = 'outline',
  size = 'default',
  className = '',
  options = {},
  uploadPreset = 'emsculpt',
}: CldUploadWidgetWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpload = (result: any) => {
    if (result.event !== 'success') return;
    
    const info = result.info;
    onUpload({
      public_id: info.public_id,
      secure_url: info.secure_url,
      width: info.width,
      height: info.height,
      format: info.format,
      resource_type: info.resource_type,
      tags: info.tags,
      context: info.context,
    });
  };

  const defaultOptions = {
    maxFiles: 1,
    resourceType: 'auto',
    multiple: false,
    ...options,
  };

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      onSuccess={handleUpload}
      options={defaultOptions}
    >
      {({ open }) => (
        <Button
          onClick={() => open()}
          variant={variant}
          size={size}
          className={className}
          disabled={isOpen}
        >
          <Image className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      )}
    </CldUploadWidget>
  );
}

export default CldUploadWidgetWrapper; 