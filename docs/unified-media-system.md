# Unified Media System

This document provides guidance on using the new Unified Media System for consistent image and video rendering across the application.

## Overview

The Unified Media System is a streamlined approach to handling media assets throughout the application. It consolidates multiple, overlapping image components into a single, versatile `UnifiedMedia` component that can handle various image and video sources, rendering optimizations, and fallback strategies.

Benefits:
- Single source of truth for media rendering
- Consistent error handling and loading states
- Proper TypeScript type definitions
- Support for images and videos
- Compatible with all existing media sources (placeholder IDs, Cloudinary public IDs, direct URLs)

## Core Components

### UnifiedMedia

The primary component for rendering all media across the application:

```tsx
import { UnifiedMedia } from '@/components/media/UnifiedMedia';

// Using a placeholder ID (recommended)
<UnifiedMedia
  placeholderId="home-hero"
  alt="Welcome to Allure MD"
  width={1200}
  height={600}
  priority
/>

// Using a Cloudinary public ID directly
<UnifiedMedia
  publicId="folder/image-name"
  alt="Direct Cloudinary image"
  width={800}
  height={400}
  options={{ quality: 90, crop: 'fill' }}
/>

// Using a direct URL
<UnifiedMedia
  src="https://example.com/image.jpg"
  alt="External image"
  width={500}
  height={300}
/>
```

### MediaAdapter

Provides backwards compatibility with all legacy components. This simplifies the migration process by allowing existing components to be replaced without changing their props:

```tsx
import { 
  MediaImage, 
  CloudinaryImage, 
  UnifiedImage,
  MediaRenderer
} from '@/components/media/MediaAdapter';

// Use the same props as the original components
<MediaImage 
  placeholderId="example-placeholder"
  alt="Example image"
  width={800}
  height={400}
/>
```

## Media Sources Priority

The UnifiedMedia component resolves media sources in this order:

1. **Direct `src` URL**: Used as-is
2. **Cloudinary `publicId`**: Transformed using Cloudinary URL utilities
3. **`placeholderId`**: Resolved via API to either database mapping or registry entry

## Property Reference

### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `placeholderId` | string | Reference ID for media in the registry or database |
| `publicId` | string | Direct Cloudinary asset ID |
| `src` | string | Direct URL to media resource |
| `mediaType` | 'image' \| 'video' \| 'auto' | Explicitly set the media type |
| `alt` | string | Alt text for accessibility |
| `width` | number | Width in pixels |
| `height` | number | Height in pixels |
| `fill` | boolean | Whether to fill the parent container |
| `priority` | boolean | Whether to prioritize loading (for LCP) |
| `options` | object | Cloudinary transformation options |

### Video-specific Properties

| Property | Type | Description |
|----------|------|-------------|
| `autoPlay` | boolean | Whether to automatically play video |
| `muted` | boolean | Whether to mute video |
| `loop` | boolean | Whether to loop video |
| `controls` | boolean | Whether to show video controls |

### UI Enhancement Properties

| Property | Type | Description |
|----------|------|-------------|
| `expandOnHover` | boolean | Whether to apply a scale effect on hover |
| `showLoading` | boolean | Whether to show loading skeleton |
| `fallbackSrc` | string | Fallback image URL if the main source fails |
| `className` | string | CSS class for the media element |
| `containerClassName` | string | CSS class for the containing div |

## Migration Guide

To migrate existing components to the Unified Media System:

### Option 1: Drop-in Replacement (Easiest)

Import the appropriate adapter from `MediaAdapter.tsx`:

```tsx
// Before
import { CloudinaryImage } from '@/components/CloudinaryImage';

// After 
import { CloudinaryImage } from '@/components/media/MediaAdapter';
```

This will continue to work with the same props as before.

### Option 2: Direct Migration to UnifiedMedia

For new code or when refactoring:

```tsx
// Before
import { MediaRenderer } from '@/components/media/MediaRenderer';

<MediaRenderer 
  placeholderId="home-hero" 
  alt="Home hero"
  width={1200}
  height={600}
/>

// After
import { UnifiedMedia } from '@/components/media/UnifiedMedia';

<UnifiedMedia
  placeholderId="home-hero"
  alt="Home hero"
  width={1200}
  height={600}
/>
```

## Examples

### Basic Image

```tsx
<UnifiedMedia
  placeholderId="home-hero"
  alt="Welcome to Allure MD"
  width={1200}
  height={600}
  priority
/>
```

### Responsive Image with Fill

```tsx
<div className="relative w-full h-96">
  <UnifiedMedia
    placeholderId="service-background"
    alt="Plastic Surgery Services"
    fill
    sizes="100vw"
    className="object-cover"
  />
</div>
```

### Video with Controls

```tsx
<UnifiedMedia
  placeholderId="procedure-video"
  mediaType="video"
  width={800}
  height={450}
  controls={true}
  autoPlay={false}
/>
```

### Image with Cloudinary Transformations

```tsx
<UnifiedMedia
  publicId="procedures/breast-augmentation/before-after-1"
  alt="Before and after breast augmentation"
  width={600}
  height={400}
  options={{
    crop: 'fill',
    gravity: 'face',
    quality: 90,
    format: 'auto'
  }}
/>
```

## API Reference

### Media Asset API

The UnifiedMedia component uses an API to resolve placeholder IDs:

```typescript
// Get media asset by placeholder ID
const asset = await fetch(`/api/media/${encodeURIComponent('home-hero')}`).then(res => res.json());
```

This API first checks for a database mapping, then falls back to the registry.

## Best Practices

1. **Use placeholder IDs for content that changes**: This allows content managers to update the media without code changes.
2. **Use direct Cloudinary public IDs for static assets**: When you know the exact asset, this provides better performance.
3. **Set proper dimensions**: Always provide `width` and `height` to avoid layout shifts.
4. **Use `priority` for above-the-fold images**: This improves LCP scores.
5. **Provide meaningful `alt` text**: Important for accessibility.
6. **Use responsive sizing**: Implement `fill` and proper `sizes` attribute for responsive layouts.
7. **Add fallback images**: Use `fallbackSrc` to handle loading errors gracefully.

## Troubleshooting

If images are not displaying properly:

1. **Check the placeholder ID**: Ensure it exists in the registry or database.
2. **Verify Cloudinary public ID**: Make sure the asset exists in your Cloudinary account.
3. **Check the API response**: Inspect the response from `/api/media/[placeholderId]`.
4. **Examine browser network tab**: Look for 404 errors or other issues with image loading.
5. **Check console errors**: The component logs detailed error messages.
