# Media System Documentation

This document provides comprehensive information about the unified media system in the FAL project. The system is designed to provide a consistent, maintainable approach to handling images and videos throughout the application.

## Overview

The FAL media system addresses several key needs:

1. **Consistent Media Handling**: A unified approach to media across the application
2. **Placeholder System**: A flexible approach to managing content placeholders
3. **Optimization**: Automatic optimization of images and videos
4. **Caching**: Efficient caching to improve performance
5. **Server Components**: Support for both client and server components

## System Components

### Core Components

1. **MediaService**: The primary service that handles all media operations
   - Located at `lib/services/media-service.ts`
   - Provides methods for retrieving, updating, and optimizing media

2. **Media Registry**: A centralized store of all media assets
   - Located at `lib/media/registry.ts`
   - Stores metadata for all media assets, including dimensions and default options

3. **Media Types**: TypeScript interfaces for all media-related types
   - Located at `lib/media/types.ts`
   - Defines interfaces for assets, placements, and options

4. **Media API**: A consolidated API for media operations
   - Located at `app/api/unified-media/route.ts`
   - Provides endpoints for retrieving and updating media

### React Components

1. **OptimizedImage**: A client component for images
   - Located at `components/media/OptimizedImage.tsx`
   - Supports placeholder IDs or direct asset IDs

2. **OptimizedVideo**: A client component for videos
   - Located at `components/media/OptimizedVideo.tsx`
   - Supports responsive sources and fallback images

3. **ServerImage**: A server component for images
   - Located at `components/media/ServerImage.tsx`
   - Loads media assets on the server for improved performance

4. **MediaRenderer**: A unified component that renders the appropriate media type
   - Located at `components/media/MediaRenderer.tsx`
   - Automatically detects the media type (image or video)

## How It Works

### Media Placeholders

The system uses "placeholders" to represent where media should appear in the application. Each placeholder has:

1. A unique ID (e.g., `home-hero`, `about-section-image`)
2. A type (image or video)
3. Mappings to actual media assets in Cloudinary

Benefits of this approach:
- Content can be changed without updating code
- Consistent naming conventions
- Centralized management

### Database Structure

The system uses three main tables in Supabase:

1. **media_assets**: Stores metadata about Cloudinary assets
   - `id`: Unique identifier
   - `cloudinary_id`: The Cloudinary public ID
   - `type`: 'image' or 'video'
   - `title`: Asset title
   - `alt_text`: Alternative text for accessibility
   - `metadata`: JSON metadata (dimensions, area, etc.)

2. **media_mappings**: Maps placeholders to media assets
   - `id`: Unique identifier
   - `placeholder_id`: The placeholder ID
   - `media_id`: Reference to media_assets.id

3. **application_structure**: Defines where placeholders are used
   - `id`: Unique identifier
   - `placeholder_id`: The placeholder ID
   - `type`: 'image' or 'video'
   - `page`: The page where the placeholder is used
   - `section`: The section within the page
   - `container`: The container within the section

### Media Flow

1. Component requests media by placeholder ID
2. MediaService checks the registry for the asset
3. If not found, it queries the database using the placeholder ID
4. The service retrieves the media asset and generates an optimized URL
5. Component renders the media with proper optimization options

## Usage Examples

### Server Component Usage

```tsx
// Using the ServerImage component in a page
import { ServerImage } from '@/components/media/ServerImage';

export default function AboutPage() {
  return (
    <div className="hero-section">
      <ServerImage 
        placeholderId="about-hero" 
        alt="About Us" 
        fill 
        priority 
        className="object-cover"
      />
      <h1>About Our Company</h1>
    </div>
  );
}
```

### Client Component Usage

```tsx
// Using the OptimizedImage component in a client component
'use client';
import { OptimizedImage } from '@/components/media/OptimizedImage';

export function TeamCard({ name, role, imageId }) {
  return (
    <div className="team-card">
      <OptimizedImage 
        id={imageId} 
        alt={name} 
        width={300} 
        height={400} 
        className="rounded-lg"
      />
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}
```

### Direct MediaService Usage

```tsx
// Using mediaService directly
import { mediaService } from '@/lib/services/media-service';

export async function ProductPage({ params }) {
  // Get product image by placeholder
  const productImage = await mediaService.getImageSrc(`product-${params.id}`);
  
  return (
    <div>
      <img src={productImage} alt="Product" />
    </div>
  );
}
```

## Best Practices

1. **Use Server Components When Possible**
   - Server components avoid the need for client-side JS and hydration
   - They render immediately with the correct props

2. **Provide Alt Text for Accessibility**
   - Always provide alt text for images
   - Use descriptive text that conveys the purpose of the image

3. **Use Appropriate Dimensions**
   - Specify width and height to avoid layout shifts
   - Use fill mode for hero images and backgrounds

4. **Optimize for Performance**
   - Use priority for above-the-fold images
   - Use responsive sizes for different viewports
   - Enable blur placeholder for better user experience

5. **Use the Registry for Static Assets**
   - Register frequently used assets in the registry
   - This improves performance by avoiding database queries

## Media Registration

To add new media assets to the registry:

1. Edit `lib/image-config.ts`
2. Add new assets following the existing pattern
3. Include proper dimensions and default options

Example:
```typescript
'about-hero': {
  id: 'about-hero',
  area: 'hero',
  description: 'About page hero image',
  publicId: 'hero/about-hero-image',
  dimensions: {
    width: 1920,
    height: 1080,
    aspectRatio: 16/9
  },
  defaultOptions: {
    width: 1920,
    quality: 90,
    format: 'auto'
  }
},
```

## Admin Interface

The admin interface allows content managers to:

1. View all placeholders in the application
2. Associate placeholders with media assets
3. Upload new media to Cloudinary
4. Edit metadata for media assets

To access the admin interface, go to `/admin/media`.

## Troubleshooting

### Common Issues

1. **Image Not Found**
   - Check if the placeholder ID exists in the database
   - Verify the Cloudinary asset exists
   - Check the mapping between placeholder and asset

2. **Image Quality Issues**
   - Check the quality option in the component props
   - Verify the dimensions of the original asset

3. **Performance Issues**
   - Use the priority prop for important images
   - Verify proper caching is implemented
   - Check image dimensions and formats

### Debugging

To debug media issues:

1. Check the browser console for errors
2. Use the `/api/unified-media?placeholderId=your-id` endpoint to check the raw data
3. Verify the Cloudinary asset using the Cloudinary Media Library

## Migration Guide

If you're migrating from the old media system:

1. Replace direct Cloudinary URLs with placeholder IDs
2. Use OptimizedImage instead of Next.js Image
3. Use ServerImage for server components
4. Register your assets in the media registry

## Conclusion

The unified media system provides a consistent, maintainable approach to handling media in the FAL project. By following the patterns and best practices outlined in this document, you can ensure that your media is optimized, accessible, and maintainable.