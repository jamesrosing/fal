# Unified Media System

## Overview

The Unified Media System provides a consistent, maintainable approach to handling images and videos throughout the application. It replaces the previous complex placeholder system with a streamlined architecture.

## Key Components

### 1. Media Service

The core of the system is the `mediaService` singleton in `lib/services/media-service.ts`. This service handles:

- Resolving placeholder IDs to media assets
- Generating optimized URLs
- Managing media mappings
- Creating responsive image/video sources

```typescript
// Example usage
import { mediaService } from '@/lib/services/media-service';

// Get media by placeholder ID
const asset = await mediaService.getMediaByPlaceholderId('home-hero');

// Get a complete URL with transformations
const url = mediaService.getMediaUrl(asset, { width: 1200, quality: 80 });

// Update a mapping
await mediaService.updateMediaMapping('home-hero', 'cloudinary/public/id');
```

### 2. React Components

Three core components provide easy-to-use interfaces for media:

#### UnifiedImage

A wrapper around Next.js Image for displaying images with optimizations.

```tsx
<UnifiedImage
  placeholderId="home-hero"
  alt="Home hero image"
  width={1200}
  height={600}
  priority
/>
```

#### UnifiedVideo

A video component with support for multiple formats, poster images, and responsive sources.

```tsx
<UnifiedVideo
  placeholderId="home-video"
  posterPlaceholderId="home-video-poster"
  options={{ autoPlay: true, muted: true, loop: true }}
  width={1200}
  height={600}
/>
```

#### MediaRenderer

A unified component that automatically detects the media type and renders the appropriate component.

```tsx
<MediaRenderer
  placeholderId="home-media"
  alt="Home media"
  width={1200}
  height={600}
  priority
/>
```

### 3. Unified API

A comprehensive API endpoint at `/api/unified-media` provides:

- GET - Fetch media by placeholder ID
- POST - Update media mappings
- PUT - Upload new media
- DELETE - Remove media mappings

API Reference:

| Method | Endpoint | Query/Body | Description |
|--------|----------|------------|-------------|
| GET | `/api/unified-media?id=placeholder-id` | id | Get media by placeholder ID |
| GET | `/api/unified-media?ids=id1,id2,id3` | ids | Get multiple media assets |
| GET | `/api/unified-media?all=true` | all | Get all media assets |
| POST | `/api/unified-media` | { placeholderId, cloudinaryId, metadata } | Update media mapping |
| PUT | `/api/unified-media` | FormData with file, placeholderId | Upload new media |
| DELETE | `/api/unified-media?id=placeholder-id` | id | Delete media mapping |

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React          │      │  Media          │      │  Supabase       │
│  Components     │──────▶  Service        │──────▶  Database       │
│                 │      │                 │      │                 │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                   │
                                   │
                         ┌─────────▼────────┐
                         │                  │
                         │  Cloudinary      │
                         │                  │
                         └──────────────────┘
```

1. React components use the Media Service to resolve placeholder IDs
2. Media Service checks in-memory registry first, then database
3. Media Service generates optimized URLs with Cloudinary transformations
4. Components receive the resolved assets and render appropriately

## Database Schema

The media system uses two main tables:

### media_assets

Stores information about individual media assets:

- `id`: UUID (primary key)
- `cloudinary_id`: Cloudinary public ID
- `type`: 'image' or 'video'
- `title`: Display title
- `alt_text`: Alt text for accessibility
- `metadata`: JSON metadata
- `width`: Original width
- `height`: Original height
- `format`: File format
- `created_at`: Timestamp
- `updated_at`: Timestamp

### media_mappings

Maps placeholder IDs to media assets:

- `id`: UUID (primary key)
- `placeholder_id`: Unique identifier for the placeholder
- `media_id`: Foreign key to media_assets.id
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Migration Guide

### 1. Replace OptimizedImage with UnifiedImage

```tsx
// Before
<OptimizedImage
  id="hero-image"
  alt="Hero"
  width={1200}
  height={600}
/>

// After
<UnifiedImage
  placeholderId="hero-image"
  alt="Hero"
  width={1200}
  height={600}
/>
```

### 2. Replace OptimizedVideo with UnifiedVideo

```tsx
// Before
<OptimizedVideo
  id="hero-video"
  posterSrc="poster.jpg"
  options={{ autoPlay: true }}
/>

// After
<UnifiedVideo
  placeholderId="hero-video"
  posterPlaceholderId="hero-video-poster"
  options={{ autoPlay: true }}
/>
```

### 3. Use MediaRenderer for Dynamic Content

```tsx
<MediaRenderer
  placeholderId="dynamic-content"
  alt="Dynamic content"
  width={800}
  height={600}
/>
```

### 4. Update API calls

```typescript
// Before
const response = await fetch(`/api/media?placeholderId=${id}`);

// After
const response = await fetch(`/api/unified-media?id=${id}`);
```

## Best Practices

1. **Always provide alt text** for accessibility

2. **Use width and height attributes** to prevent layout shifts

3. **Use the priority prop** for above-the-fold images

4. **Use proper sizing** to avoid loading oversized images
   - Set `sizes` attribute to match your layout
   - Use responsive breakpoints for different device sizes

5. **Use MediaRenderer** when you're not sure of the media type

6. **Organize media** in Cloudinary using consistent folder structures

7. **Use descriptive placeholder IDs** that reflect the content's purpose

8. **Add detailed metadata** for better searchability and management

## Advanced Usage

### Responsive Images

```tsx
<UnifiedImage
  placeholderId="hero-image"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
/>
```

### Video with Custom Options

```tsx
<UnifiedVideo
  placeholderId="product-video"
  options={{
    autoPlay: false,
    controls: true,
    muted: false,
    loop: false,
    quality: 90
  }}
  width={800}
  height={450}
/>
```

### Upload New Media

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('placeholderId', 'new-hero-image');
formData.append('folder', 'heroes');

const response = await fetch('/api/unified-media', {
  method: 'PUT',
  body: formData
});
```

## Troubleshooting

1. **Image Not Found**: Check that the placeholder ID exists in the database

2. **Video Not Playing**: Ensure the video is properly formatted for web (MP4/WebM)

3. **Media Not Loading**: Check the network tab for API errors

4. **Poor Performance**: Check the image dimensions and format; use WebP where possible

5. **Missing Alt Text**: Always set the alt attribute or alt_text in the metadata
