# Best Practices for Image and Video Organization in Next.js

This document outlines the recommended best practices for organizing media assets in our Next.js application. Following these guidelines ensures consistency, maintainability, and optimal performance for all media resources.

## 1. Structured Directory Hierarchy

### Public Static Assets

For static assets stored locally (not in Cloudinary):

```
public/
  ├── images/
  │   ├── global/         # Shared across multiple pages
  │   │   ├── logos/      # Brand logos
  │   │   ├── icons/      # Icon assets
  │   │   └── ui/         # UI elements
  │   └── pages/          # Page-specific folders
  │       ├── home/
  │       ├── about/
  │       ├── services/   # Service category images
  │       │   ├── plastic-surgery/
  │       │   ├── dermatology/
  │       │   ├── medical-spa/
  │       │   └── functional-medicine/
  │       └── team/       # Team-related assets
  └── videos/
      ├── backgrounds/    # Video backgrounds
      └── content/        # Content videos
```

### Cloudinary Structure

For Cloudinary assets, we organize using the following folders:

```
fal/                      # Root folder
  ├── hero/               # Hero section images
  ├── articles/           # Article header and content images
  ├── services/           # Service category images
  │   ├── plastic-surgery/
  │   ├── dermatology/
  │   ├── medical-spa/
  │   └── functional-medicine/
  ├── team/
  │   └── headshots/      # Team member headshots
  ├── gallery/            # Gallery images
  ├── branding/           # Logo and brand assets
  └── videos/
      ├── backgrounds/    # Background videos
      └── thumbnails/     # Video thumbnails
```

## 2. Component-Specific Media

For components that require specific media assets, co-locate them within the component directory:

```
components/
  ├── Hero/
  │   ├── Hero.tsx
  │   └── assets/         # Component-specific assets
  ├── ServiceCard/
  │   ├── ServiceCard.tsx
  │   └── assets/         # Component-specific assets
  └── TeamMember/
      ├── TeamMember.tsx
      └── assets/         # Component-specific images
```

### Implementation Example

```tsx
// components/Hero/Hero.tsx
import { OptimizedImage } from '@/components/media/OptimizedImage';
import localBackground from './assets/hero-background.jpg';

export function Hero() {
  // Use local asset from component directory
  return (
    <div className="relative h-screen">
      <OptimizedImage
        id="component:Hero/assets/hero-background.jpg" 
        alt="Hero background"
        fill
      />
      {/* Other content */}
    </div>
  );
}
```

Our `OptimizedImage` component has been enhanced to support both local component assets and Cloudinary assets.

## 3. Page-Specific Media Imports

For page-level media, import directly within page components using our media components:

```tsx
// app/services/page.tsx
import { OptimizedImage } from '@/components/media/OptimizedImage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Medical and aesthetic services offered by FAL'
};

export default function ServicesPage() {
  return (
    <div className="container">
      <OptimizedImage 
        id="services/main-header" 
        alt="Our Services" 
        fill
        priority
      />
      {/* Page content */}
    </div>
  );
}
```

## 4. Layout-Based Placement

Define media placement based on layout components:

```tsx
// components/layouts/TwoColumnLayout.tsx
import { MediaRenderer } from '@/components/media/MediaRenderer';

export function TwoColumnLayout({ 
  leftMedia, 
  rightContent 
}) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="col-span-1 relative min-h-[400px]">
        <MediaRenderer 
          id={leftMedia.id} 
          alt={leftMedia.alt} 
          fill 
        />
      </div>
      <div className="col-span-1">
        {rightContent}
      </div>
    </div>
  );
}
```

## 5. Media Asset Registration

Register all media assets in a central registry:

```tsx
// lib/image-config.js
import { MediaAsset } from './media/types';

export const IMAGE_ASSETS = {
  'hero-main': {
    id: 'hero-main',
    area: 'hero',
    description: 'Main hero image',
    publicId: 'hero/main-hero',
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
  'team-dr-smith': {
    id: 'team-dr-smith',
    area: 'team',
    description: 'Dr. Smith headshot',
    publicId: 'team/headshots/dr-smith',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  }
};
```

## 6. Responsive Image Loading

Use responsive image loading patterns to optimize for different screen sizes:

```tsx
// components/ResponsiveGalleryImage.tsx
import { OptimizedImage } from '@/components/media/OptimizedImage';

export function ResponsiveGalleryImage({ id, alt }) {
  return (
    <div className="w-full">
      <OptimizedImage
        id={id}
        alt={alt}
        options={{
          width: 320,
          height: 240
        }}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="w-full h-auto"
      />
    </div>
  );
}
```

## 7. Media Component Best Practices

1. **Always Provide Alt Text**
   - All images must have descriptive alt text for accessibility

2. **Use Priority for Above-the-Fold Images**
   - Add `priority` prop to critical images visible on initial load

3. **Implement Proper Loading States**
   - Use blur placeholders or skeleton loaders for a smooth user experience

4. **Use Appropriate Image Format**
   - Let Cloudinary optimize formats with `f_auto`
   - Use WebP or AVIF for local images when possible

5. **Optimize Video Loading**
   - Always include a poster/thumbnail image for videos
   - Implement lazy loading for videos below the fold
   - Use appropriate compression and formats

## 8. Migration and Maintenance

1. **Run Regular Audits**
   ```bash
   npm run media:verify
   ```

2. **Update Assets Registry**
   - Keep `lib/image-config.js` updated with all assets 

3. **Optimize Existing Assets**
   - Use the migration tool to convert legacy implementations
   ```bash
   npm run media:migrate
   ```

By following these guidelines, we ensure that our media assets are well-organized, properly optimized, and maintainable across the entire application. 