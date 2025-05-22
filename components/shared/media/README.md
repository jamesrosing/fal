# Media Components

This directory contains the media components used throughout the application.

## Cloudinary Migration Status

We've completed the migration to [next-cloudinary](https://next.cloudinary.dev/), which is officially supported by Cloudinary and optimized for Next.js.

### Current Components (Use These)

- **CldImage**: Use for all images from Cloudinary
  ```jsx
  import CldImage from '@/components/media/CldImage';
  
  <CldImage 
    src="folder/image-name"
    alt="Description"
    width={800}
    height={600}
    priority
  />
  ```

- **CldVideo**: Use for all videos from Cloudinary
  ```jsx
  import CldVideo from '@/components/media/CldVideo';
  
  <CldVideo
    publicId="folder/video-name"
    width={800}
    height={450}
    controls
  />
  ```

- **MediaAdapter**: Utility component that handles different media types
  ```jsx
  import MediaAdapter from '@/components/media/MediaAdapter';
  
  <MediaAdapter
    mediaType="image" // or "video"
    src="folder/image-name" // or publicId for backward compatibility
    alt="Description"
    width={800}
    height={600}
  />
  ```

- **CldUploadWidget**: Use for uploading media to Cloudinary
  ```jsx
  import CldUploadWidget from '@/components/media/CldUploadWidget';
  
  <CldUploadWidget
    onSuccess={(result) => {
      console.log(result.info.public_id);
    }}
  />
  ```

- **CloudinaryFolderImage**: For rendering images from specific Cloudinary folders
  ```jsx
  import { CloudinaryFolderImage } from '@/components/media/CloudinaryFolderImage';
  
  <CloudinaryFolderImage
    folder="articles"
    imageName="article-image-name"
    width={800}
    height={600}
    alt="Article image"
  />
  ```

- **CloudinaryFolderGallery**: For rendering a gallery of images from a folder
  ```jsx
  import { CloudinaryFolderGallery } from '@/components/media/CloudinaryFolderGallery';
  
  <CloudinaryFolderGallery
    folder="gallery/emsculpt"
    columns={3}
    gap={4}
  />
  ```

### Legacy Components (Removed)

The following legacy components have been removed:
- ~~OptimizedImage~~ - Use `CldImage` instead
- ~~OptimizedVideo~~ - Use `CldVideo` instead
- ~~CloudinaryImage~~ - Use `CldImage` instead
- ~~CloudinaryVideo~~ - Use `CldVideo` instead
- ~~UnifiedMedia~~ - Use `MediaAdapter` instead
- ~~UnifiedImage~~ - Use `CldImage` instead
- ~~UnifiedVideo~~ - Use `CldVideo` instead
- ~~ServerImage~~ - Use `CldImage` instead

## Usage Examples

See the example implementation at:
- `/app/example/cloudinary-examples/page.tsx`
- `/components/example/CloudinaryExample.tsx`

## Migration Plan (Completed)

The migration has been completed in phases:
1. ✅ Remove transitional components (UnifiedMedia, UnifiedImage, UnifiedVideo)
2. ✅ Update core components to use Cloudinary directly
3. ✅ Replace all OptimizedImage usage with CldImage
4. ✅ Final cleanup and documentation

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## Benefits of Migration

- **Performance**: Cloudinary's automatic format optimization and responsive images
- **Flexibility**: Advanced transformations and effects
- **Simplicity**: Fewer abstraction layers with direct Cloudinary components
- **Maintenance**: Officially supported by Cloudinary and Next.js 

## Next Steps for Cleanup (See memory-bank/cloudinary/cloudinary-cleanup-plan.md)

1. Consolidate Cloudinary utility functions
2. Standardize component APIs
3. Clean up duplicate utility files
4. Standardize prop naming conventions
5. Remove debug code 