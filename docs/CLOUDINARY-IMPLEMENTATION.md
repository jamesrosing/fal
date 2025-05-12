# Cloudinary Implementation Guide

This document outlines the standard Cloudinary implementation for our Next.js project.

## Setup

The project uses the official Cloudinary integration for Next.js:

- **Package**: `next-cloudinary` (v6.16.0+)
- **Configuration**: Implemented in `next.config.ts`

### Environment Variables

Required environment variables:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key 
CLOUDINARY_API_SECRET=your_api_secret
```

### Next.js Configuration

The `next.config.ts` includes:

```javascript
images: {
  domains: ['res.cloudinary.com'],
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
  ],
},
transpilePackages: ['next-cloudinary'],
```

## Components

### Images

Use the standard `CldImage` component from `next-cloudinary`:

```jsx
import { CldImage } from 'next-cloudinary';

// Basic usage
<CldImage
  src="folder/image-name"
  width={800}
  height={600}
  alt="Description"
/>

// With transformations
<CldImage
  src="folder/image-name"
  width={800}
  height={600}
  alt="Description"
  crop="fill"
  gravity="auto"
  quality="auto"
  format="auto"
/>

// Responsive
<CldImage
  src="folder/image-name"
  width={800}
  height={600}
  alt="Description"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Videos

Use the standard `CldVideoPlayer` component:

```jsx
import { CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';

<CldVideoPlayer
  src="folder/video-name"
  width="800"
  height="450"
  autoplay={false}
  controls={true}
  muted={true}
/>
```

## API Integration

### Fetching Media Assets

We use API routes to fetch and map placeholder IDs to Cloudinary public IDs:

- `/api/media/[placeholderId]` - Fetches a specific asset
- `/api/media/assets` - Lists available assets

## Best Practices

1. **Use Cloudinary CDN**: All media is served directly from Cloudinary's CDN for optimal performance.

2. **Responsive Images**: Use the `sizes` attribute to serve appropriately sized images:
   ```jsx
   sizes="(max-width: 768px) 100vw, 50vw"
   ```

3. **Automatic Optimizations**: Always use:
   ```jsx
   quality="auto"
   format="auto"
   ```

4. **Lazy Loading**: For non-critical images, use:
   ```jsx
   loading="lazy"
   ```

5. **Priority Loading**: For LCP (Largest Contentful Paint) images:
   ```jsx
   priority={true}
   ```

6. **Transformations**: Use built-in transformations for image optimization:
   ```jsx
   crop="fill"  // or "scale", "fit", etc.
   gravity="auto"  // or "face", "center", etc.
   ```

## Folder Structure

Our Cloudinary account follows this organization:

- `/global/` - Common UI elements and icons
- `/pages/` - Page-specific imagery
  - `/home/`
  - `/about/`
  - `/services/`
  - etc.
- `/team/` - Team member photos
- `/gallery/` - Gallery images

## Migration Notes

When migrating from local images to Cloudinary:

1. Use the API endpoint `/api/media/[placeholderId]` to get the Cloudinary public ID
2. Replace `Image` with `CldImage`
3. Update `src` to use the Cloudinary public ID
4. Add appropriate transformations

## Testing

A test page is available at `/example/cloudinary-test` to verify the implementation. 