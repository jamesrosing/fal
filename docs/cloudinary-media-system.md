# Cloudinary Media System

This document outlines our standardized approach to media management using Cloudinary and Next.js.

## Installation and Setup

To use the Cloudinary Media System in this project, you need to:

1. Install the next-cloudinary package:
   ```bash
   npm install next-cloudinary
   ```

2. Set up your environment variables in `.env.local` (already configured):
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyrzyfg3w
   NEXT_PUBLIC_CLOUDINARY_API_KEY=956447123689192
   CLOUDINARY_API_SECRET=zGsan0MXgwGKIGnQ0t1EVKYSqg0
   ```

3. Import and use the CloudinaryImage or CloudinaryVideo components in your pages.

## Overview

The Cloudinary Media System provides a unified way to handle images and videos throughout the application, leveraging Cloudinary's powerful optimization and transformation capabilities while maintaining backward compatibility with our existing media structure.

## Important Notes

1. **Always include width and height**: Unlike Next.js's Image component, when using `CloudinaryImage` with the `fill` property, you must still include explicit `width` and `height` props. These dimensions are required for Cloudinary's transformations to work properly, even in fill mode. For example:

   ```tsx
   <CloudinaryImage
     id="fal/pages/services/hero"
     alt="Hero Image"
     fill
     width={1200}  // Required even with fill=true
     height={800}  // Required even with fill=true
     className="object-cover"
   />
   ```

   Omitting width and height when using fill mode will result in transformation errors.

## Directory Structure

### Cloudinary Structure

```
fal/                      # Root folder in Cloudinary
  ├── pages/              # Page-specific media (matches public/images/pages)
  │   ├── home/
  │   ├── services/
  │   │   ├── plastic-surgery/
  │   │   └── ...
  │   └── ...
  ├── components/         # Component-specific media
  │   ├── Hero/assets/
  │   └── ...
  └── ...
```

## Components

### CloudinaryImage

The `CloudinaryImage` component is designed to handle all image types including:
- Cloudinary-hosted images
- Local images (with `page:` or `component:` prefixes)
- External URLs

```tsx
import { CloudinaryImage } from '@/components/media/CloudinaryMedia';

// Using a Cloudinary image directly
<CloudinaryImage
  id="fal/pages/services/plastic-surgery/hero"
  alt="Plastic Surgery"
  width={800}
  height={600}
/>

// Using a local image with page: prefix (automatically converted)
<CloudinaryImage
  id="page:services/plastic-surgery/hero.jpg"
  alt="Plastic Surgery"
  width={800}
  height={600}
/>

// With fill mode (takes parent dimensions)
<CloudinaryImage
  id="fal/pages/services/plastic-surgery/hero"
  alt="Plastic Surgery"
  fill
  className="object-cover"
/>

// With Cloudinary transformations
<CloudinaryImage
  id="fal/pages/services/plastic-surgery/hero"
  alt="Plastic Surgery"
  width={800}
  height={600}
  options={{
    crop: "fill",
    gravity: "auto"
  }}
/>
```

### CloudinaryVideo

The `CloudinaryVideo` component handles video content:

```tsx
import { CloudinaryVideo } from '@/components/media/CloudinaryMedia';

// Basic usage
<CloudinaryVideo
  id="fal/videos/hero-background"
  width={800}
  height={450}
  controls
/>

// Full-width background video
<CloudinaryVideo
  id="fal/videos/hero-background"
  autoPlay
  loop
  muted
  fill
  className="object-cover"
/>

// With poster image
<CloudinaryVideo
  id="fal/videos/tour"
  width={800}
  height={450}
  controls
  poster="fal/videos/thumbnails/tour"
/>
```

### CloudinaryMedia

The `CloudinaryMedia` component automatically detects the media type and renders the appropriate component:

```tsx
import { CloudinaryMedia } from '@/components/media/CloudinaryMedia';

// Will render as image or video based on file extension or type prop
<CloudinaryMedia
  id="fal/pages/about/team-video.mp4" // or any media ID
  width={800}
  height={600}
/>
```

## ID Formats

The system supports three ID formats:

1. **Direct Cloudinary path**: `fal/pages/services/plastic-surgery/hero`
   - Used for assets already in Cloudinary
   - Most performant option

2. **Page-specific path**: `page:services/plastic-surgery/hero.jpg`
   - Maps to local files during development
   - Will be sent to Cloudinary in production
   - Compatible with existing code

3. **Component-specific path**: `component:Hero/assets/background.jpg`
   - Maps to component-specific assets
   - Same handling as page-specific paths

## Migration

### Using the Upload Script

We've created a script to upload local images to Cloudinary. It maintains our directory structure and naming conventions.

```bash
# Install cloudinary if needed
npm install cloudinary

# Run the upload script
node scripts/upload-to-cloudinary.js
```

### Best Practices

1. **Use CloudinaryImage for all images**
   - Begin migrating from OptimizedImage to CloudinaryImage
   - Maintain the same props format for compatibility

2. **Standardize on direct Cloudinary paths**
   - For new content, prefer direct Cloudinary paths (e.g., `fal/pages/...`)
   - This format is more efficient and avoids translation overhead

3. **Always set dimensions or use fill**
   - Set explicit width and height for non-fill images
   - Use fill for images that should take their container's dimensions

4. **Set quality appropriately**
   - Use quality=90 for critical images
   - Use quality=80 for standard images
   - Use quality=60-70 for background images

5. **Use proper transformations**
   - Use crop="fill" for images that need to cover a specific area
   - Use gravity="auto" to let Cloudinary choose the focal point

## Examples

### Hero Section

```tsx
<section className="relative h-screen">
  <div className="absolute inset-0">
    <CloudinaryImage 
      id="fal/pages/services/hero"
      alt="Services"
      fill
      priority
      className="object-cover"
    />
    <div className="absolute inset-0 bg-black/50" />
  </div>
  <div className="relative z-10">
    {/* Content */}
  </div>
</section>
```

### Image Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id} className="aspect-square relative">
      <CloudinaryImage
        id={item.imageId}
        alt={item.title}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  ))}
</div>
```

### Video Background

```tsx
<div className="relative h-screen">
  <CloudinaryVideo
    id="fal/videos/backgrounds/home-hero"
    autoPlay
    loop
    muted
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 bg-black/30" />
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
``` 