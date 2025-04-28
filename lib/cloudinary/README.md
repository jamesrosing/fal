# Cloudinary Media System

This directory contains the Cloudinary integration for the Allure MD website. The system uses the next-cloudinary package to provide optimized image and video delivery via Cloudinary's CDN.

## Components

### CldImage

The `CldImage` component is an enhanced wrapper around next-cloudinary's CldImage that adds:

- Skeleton loading state during image load
- Error handling with fallback images
- Responsive image support
- Automatic quality and format optimization

```tsx
import CldImage from '@/components/media/CldImage';

// Basic usage
<CldImage
  publicId="folder/image-name"
  alt="Description of the image"
  width={800}
  height={600}
/>

// With additional options
<CldImage
  publicId="folder/image-name"
  alt="Description of the image"
  width={800}
  height={600}
  priority={true}  // For LCP images
  sizes="(max-width: 768px) 100vw, 50vw"
  crop="fill"
  gravity="auto"
  quality="auto"
  className="rounded-lg"
  showLoading={true}
  fallbackSrc="/placeholder-image.jpg"
/>
```

### CldVideo

The `CldVideo` component is an enhanced wrapper around next-cloudinary's CldVideoPlayer that adds:

- Skeleton loading state during video load
- Error handling with fallback videos
- Responsive video support
- Proper event handling

```tsx
import CldVideo from '@/components/media/CldVideo';

// Basic usage
<CldVideo
  publicId="folder/video-name"
  width={800}
  height={450}
  controls
/>

// With additional options
<CldVideo
  publicId="folder/video-name"
  width={800}
  height={450}
  autoPlay={true}
  loop={true}
  muted={true}
  controls={true}
  className="rounded-lg"
  showLoading={true}
  fallbackSrc="/placeholder-video.mp4"
  transformation={[
    {
      quality: "auto",
      width: 800,
      height: 450,
      crop: "fill"
    }
  ]}
/>
```

## Utility Functions

### OG Image Generation

The `og-image.ts` module provides utilities for generating Open Graph images:

```tsx
import { generateArticleOgImage } from '@/lib/cloudinary/og-image';

// In your page component
export const metadata = {
  openGraph: {
    images: [{
      url: generateArticleOgImage(
        'Article Title',
        'folder/article-hero',
        'branding/logo'
      ),
      width: 1200,
      height: 630,
    }],
  },
};
```

## Media Service

The `media-service.ts` provides a centralized way to interact with media assets in the database:

```tsx
import { mediaService } from '@/lib/services/media-service';

// Get a media asset by public ID
const asset = await mediaService.getMediaByPublicId('folder/image-name');

// Get media for a gallery
const galleryMedia = await mediaService.getGalleryMedia(galleryId);

// Search for media assets
const searchResults = await mediaService.searchMedia('beach', 'image', 20);
```

## Migration

The system includes a migration script to transfer data from the placeholder-based system to the direct public ID system:

```bash
npx ts-node scripts/migrate-to-cloudinary-direct.ts
```

## Configuration

The Next.js configuration in `next.config.ts` includes the necessary settings for Cloudinary:

- Transpiles the next-cloudinary package
- Configures image domains and remote patterns
- Sets environment variables for Cloudinary

## Environment Variables

The following environment variables are used:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key (for admin operations)
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret (for admin operations)

## Database Schema

Media assets are stored in the `media_assets` table with the following structure:

- `id`: UUID of the asset
- `public_id`: Cloudinary public ID
- `type`: Asset type ('image' or 'video')
- `title`: Title for the asset
- `alt_text`: Alt text for accessibility
- `width`: Width of the asset in pixels
- `height`: Height of the asset in pixels
- `format`: File format
- `tags`: Array of tags
- `metadata`: JSONB field for additional metadata
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp 