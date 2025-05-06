# Media Components

This directory contains the media components used throughout the application.

## Migration to next-cloudinary

We are in the process of migrating from custom Cloudinary implementation to [next-cloudinary](https://next.cloudinary.dev/), which is officially supported by Cloudinary and optimized for Next.js.

### New Components (Use These for New Features)

- **CldImageWrapper**: Use for all images from Cloudinary
- **CldVideoWrapper**: Use for all videos from Cloudinary
- **CldUploadWidgetWrapper**: Use for uploading media to Cloudinary
- **CldMediaLibrary**: Use for selecting media from the Cloudinary Media Library

### Legacy Components (Will Be Deprecated)

- CloudinaryImage
- CloudinaryVideo
- CloudinaryMediaLibrary
- CloudinaryFolderImage
- CloudinaryFolderGallery

## Usage Examples

See the example implementation at:
- `/app/example/cloudinary-examples/page.tsx`
- `/components/example/CloudinaryExample.tsx`

## Migration Strategy

See the full migration strategy document at `/docs/migration-strategy.md`.

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
``` 