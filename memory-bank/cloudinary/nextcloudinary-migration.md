# Migration Guide: Custom Cloudinary to next-cloudinary

## Big Bang Migration Strategy

We've adopted a comprehensive "Big Bang" approach to migrate from our custom Cloudinary implementation to the standard next-cloudinary components. This approach involves:

### Migration Components

1. **Database Migration** (`migrate-media-to-cloudinary.js`)
   - Maps placeholder IDs to Cloudinary public IDs
   - Migrates static registry assets to the media_assets table
   - Handles legacy media_assets_old table data if it exists
   - Generates a JSON mapping file for the code migration script

2. **Code Migration** (`cloudinary-code-migration.ts`)
   - Scans codebase for files using placeholder components or placeholderId props
   - Replaces imports of placeholder components with CldImage/CldVideo
   - Converts placeholderId props to publicId props
   - Updates component tags in JSX code
   - Creates backups of files before modifications
   - Adds TODO comments for dynamic placeholderId props that need manual review

3. **Legacy Cleanup** (`cleanup-legacy-media.ts`)
   - Checks for remaining references to legacy components
   - Creates backups of files before deletion
   - Removes legacy components, services, and configurations
   - Provides database cleanup instructions

### Implementation Challenges

- Module system mismatch (ES modules vs CommonJS) in migration scripts
- TypeScript type safety issues requiring proper annotations
- Windows compatibility for grep-based file search commands
- Need for manual review of dynamic placeholderId props

### Migration Execution Sequence

1. First: Run `migrate-media-to-cloudinary.js` to handle database migration
2. Second: Run `cloudinary-code-migration.ts` to update component references
3. Third: Run `cleanup-legacy-media.ts` to remove legacy components
4. Finally: Manually verify and fix any remaining issues or TODO comments

Your project already has the `next-cloudinary` package installed but isn't using its components yet. This guide will help you migrate from your custom Cloudinary implementation to the standard next-cloudinary approach.

## Step 1: Configure Environment Variables

Make sure you have the required environment variables set up in your `.env.local` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyrzyfg3w  # Your cloud name from the existing config
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset  # For upload widget
```

## Step 2: Replace CloudinaryImage Component

Replace your custom CloudinaryImage with the CldImage component from next-cloudinary.

### Create a Wrapper Component

Create a new file at `components/media/CldImageWrapper.tsx`:

```tsx
'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { ImageArea, IMAGE_PLACEMENTS } from '@/lib/cloudinary';

export interface CldImageWrapperProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  area?: ImageArea;
  responsive?: boolean;
  priority?: boolean;
  expandOnHover?: boolean;
  fallbackSrc?: string;
  className?: string;
}

export function CldImageWrapper({
  publicId,
  alt,
  width,
  height,
  sizes = '100vw',
  area,
  responsive = true,
  priority = false,
  expandOnHover = false,
  fallbackSrc,
  className = '',
}: CldImageWrapperProps) {
  const [error, setError] = useState(false);

  // Handle missing or empty publicId
  if (!publicId || error) {
    // Use fallback image if provided
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt || 'Placeholder image'}
          width={width || 200}
          height={height || 150}
          className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
        />
      );
    }
    
    // Use default placeholder
    return (
      <div 
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ width: `${width || 200}px`, height: `${height || 150}px` }}
      />
    );
  }

  // If area is specified, get default dimensions and options
  let finalWidth = width;
  let finalHeight = height;
  let cropMode = 'fill';
  let gravity = 'auto';
  
  if (area && IMAGE_PLACEMENTS[area]) {
    const areaConfig = IMAGE_PLACEMENTS[area];
    finalWidth = finalWidth || areaConfig.dimensions.width;
    finalHeight = finalHeight || areaConfig.dimensions.height;
    
    // Extract transformations from area config
    const cropTransform = areaConfig.transformations.find(t => t.startsWith('c_'));
    const gravityTransform = areaConfig.transformations.find(t => t.startsWith('g_'));
    
    if (cropTransform) cropMode = cropTransform.substring(2);
    if (gravityTransform) gravity = gravityTransform.substring(2);
  }

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={finalWidth || 800}
      height={finalHeight || 600}
      sizes={responsive ? sizes : undefined}
      crop={cropMode}
      gravity={gravity}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      className={`${className} ${expandOnHover ? 'transition-transform hover:scale-105' : ''}`}
      onError={() => setError(true)}
      preserveTransformations
    />
  );
}

export default CldImageWrapper;
```

## Step 3: Replace CloudinaryVideo Component

Replace your custom CloudinaryVideo with the CldVideoPlayer component.

### Create a Wrapper Component

Create a new file at `components/media/CldVideoWrapper.tsx`:

```tsx
'use client';

import { CldVideoPlayer } from 'next-cloudinary';
import { useState } from 'react';

export interface CldVideoWrapperProps {
  publicId: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  poster?: string;
  onError?: () => void;
  onEnded?: () => void;
  fallbackSrc?: string;
}

export function CldVideoWrapper({
  publicId,
  width = 'auto',
  height = 'auto',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
  poster,
  onError,
  onEnded,
  fallbackSrc,
}: CldVideoWrapperProps) {
  const [error, setError] = useState(false);

  // Handle missing publicId or errors
  if (!publicId || error) {
    if (fallbackSrc) {
      return (
        <video
          src={fallbackSrc}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          style={{ 
            width: typeof width === 'string' ? width : undefined,
            height: typeof height === 'string' ? height : undefined
          }}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          className={className}
          onEnded={onEnded}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return (
      <div 
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          aspectRatio: '16/9'
        }}
      />
    );
  }

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  return (
    <CldVideoPlayer
      id={`video-${publicId.replace(/[^a-zA-Z0-9]/g, '-')}`}
      width={width}
      height={height}
      src={publicId}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      onError={handleError}
      onEnded={onEnded}
      transformation={{
        quality: 'auto',
      }}
      poster={poster ? { src: poster } : undefined}
    />
  );
}

export default CldVideoWrapper;
```

## Step 4: Replace CloudinaryMediaLibrary Component

Replace your CloudinaryMediaLibrary component with CldUploadWidget.

### Create a Wrapper Component

Create a new file at `components/media/CldUploadWidget.tsx`:

```tsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
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
  uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
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
```

## Step 5: Create a Media Library Component

Create a wrapper for the media library functionality:

```tsx
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
```

## Step 6: Implement Schema.org for Images and Videos

Create a new file at `lib/schema.ts` or update your existing one:

```tsx
import { CldImageProps } from 'next-cloudinary';

export function generateImageSchema(image: {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": imageUrl,
    "name": image.alt,
    "description": image.alt,
    "width": image.width || 800,
    "height": image.height || 600
  };
}
```

## Step 7: Usage Examples

### Basic Image Example
```tsx
'use client';

import { CldImageWrapper } from '@/components/media/CldImageWrapper';

export default function ProductImage() {
  return (
    <CldImageWrapper
      publicId="products/product-123"
      alt="Product description"
      width={600}
      height={400}
      priority={true}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      className="rounded-lg shadow-md"
    />
  );
}
```

### Video Example
```tsx
'use client';

import { CldVideoWrapper } from '@/components/media/CldVideoWrapper';

export default function HeroVideo() {
  return (
    <CldVideoWrapper
      publicId="videos/hero-video"
      width="100%"
      height="auto"
      autoPlay
      loop
      muted
      controls={false}
      className="w-full h-auto rounded-lg shadow-lg"
    />
  );
}
```

### Upload Widget Example
```tsx
'use client';

import { CldUploadWidgetWrapper } from '@/components/media/CldUploadWidget';
import { useState } from 'react';

export default function ProfileImageUploader() {
  const [imageUrl, setImageUrl] = useState('');
  
  const handleUpload = (result: any) => {
    setImageUrl(result.secure_url);
    console.log('Uploaded image:', result);
  };
  
  return (
    <div>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Uploaded image" 
          className="w-32 h-32 rounded-full mb-4" 
        />
      )}
      
      <CldUploadWidgetWrapper
        onUpload={handleUpload}
        buttonText="Upload Profile Picture"
        variant="default"
        options={{
          maxFiles: 1,
          resourceType: 'image',
          folder: 'profiles',
          tags: ['profile', 'user'],
          sources: ['local', 'camera'],
          clientAllowedFormats: ['png', 'jpg', 'jpeg'],
          maxFileSize: 10000000,
        }}
      />
    </div>
  );
}
```

## Step 8: Migration Strategy

1. **Start with New Components**: Begin by implementing the new components in new features or pages.
2. **Gradual Replacement**: Replace existing components one by one, starting with less critical sections.
3. **Test Thoroughly**: After each replacement, test to ensure everything works as expected.
4. **Monitor Performance**: Watch for any performance improvements or issues.

## Benefits of Migration

1. **Reduced Code Complexity**: Eliminating custom implementation reduces maintenance burden.
2. **Better Performance**: CldImage and other next-cloudinary components are optimized for Next.js.
3. **Easier Updates**: Leveraging official components means you'll get improvements and bug fixes automatically.
4. **Better SEO**: Proper handling of image loading, lazy loading, and placeholders improves Core Web Vitals.

By following this guide, you'll successfully migrate from your custom Cloudinary implementation to the more standard and maintainable next-cloudinary approach.
