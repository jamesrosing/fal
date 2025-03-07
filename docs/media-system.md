# Media System Documentation

This document outlines the media system architecture, which provides a robust way to manage and display media assets throughout the application.

## Overview

The media system consists of several components:

1. **Media Map**: A comprehensive inventory of all media placeholders in the application
2. **Media Assets**: Associations between placeholder IDs and Cloudinary public IDs
3. **React Hooks**: Client-side hooks for using media assets in components
4. **API Endpoints**: Server-side endpoints for retrieving and updating media data
5. **Database Tables**: Supabase tables for storing media data

## Media Map

The media map is a structured representation of all media placeholders in the application. It is generated automatically by scanning the codebase for media placeholder references.

### Generating the Media Map

To generate the media map, run:

```bash
npm run generate-media-map
```

This script scans the codebase for patterns like `useMediaAsset('placeholder-id')` and creates a structured JSON file at `app/api/site/media-map/data.json`.

### Media Map Structure

The media map is structured as follows:

```json
[
  {
    "id": "section-id",
    "name": "Section Name",
    "path": "/section-path",
    "sections": [
      {
        "id": "area-id",
        "name": "Area Name",
        "description": "Area description",
        "mediaPlaceholders": [
          {
            "id": "placeholder-id",
            "name": "Placeholder Name",
            "description": "Placeholder description",
            "area": "area-id",
            "path": "section/area",
            "dimensions": {
              "width": 800,
              "height": 600,
              "aspectRatio": 1.33
            }
          }
        ]
      }
    ]
  }
]
```

## Database Tables

The media system uses two Supabase tables:

### media_placeholders

Stores information about media placeholders:

| Column      | Type      | Description                       |
|-------------|-----------|-----------------------------------|
| id          | TEXT      | Primary key, placeholder ID       |
| name        | TEXT      | Display name                      |
| description | TEXT      | Description                       |
| area        | TEXT      | Media area (hero, article, etc.)  |
| path        | TEXT      | Suggested Cloudinary folder path  |
| dimensions  | JSONB     | Width, height, and aspect ratio   |
| created_at  | TIMESTAMP | Creation timestamp                |
| updated_at  | TIMESTAMP | Last update timestamp             |

### media_assets

Stores associations between placeholder IDs and Cloudinary public IDs:

| Column               | Type      | Description                     |
|----------------------|-----------|---------------------------------|
| placeholder_id       | TEXT      | Primary key, references media_placeholders.id |
| cloudinary_id        | TEXT      | Cloudinary public ID            |
| uploaded_at          | TIMESTAMP | Upload timestamp                |
| uploaded_by          | TEXT      | User who uploaded the asset     |
| metadata             | JSONB     | Additional metadata             |

## Syncing Media Placeholders

To sync the media placeholders from the media map to Supabase, run:

```bash
npm run sync-media-placeholders
```

This script reads the media map and upserts the placeholders into the `media_placeholders` table in Supabase.

## Using Media Assets in Components

### Client Components

```tsx
'use client';
import { useMediaAsset } from '@/hooks/useMedia';

export function HeroSection() {
  const { url, isLoading, error } = useMediaAsset('home-hero-background');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="hero" style={{ backgroundImage: `url(${url})` }}>
      <h1>Welcome to our site</h1>
    </div>
  );
}
```

### Server Components

```tsx
import { getMediaAsset } from '@/hooks/useMedia';

export async function FeaturedArticle({ id }: { id: string }) {
  const imageUrl = await getMediaAsset(`featured-article-${id}`);
  
  return (
    <div className="article">
      {imageUrl && <img src={imageUrl} alt="Featured Article" />}
      <h2>Article Title</h2>
    </div>
  );
}
```

## Admin Interface

The admin interface should provide a way to:

1. View all media placeholders
2. Upload or select media assets for each placeholder
3. Preview how the media will look in the application
4. Manage existing media assets

## Best Practices

1. **Use Consistent Naming**: Follow a consistent naming pattern for placeholder IDs (e.g., `section-name-purpose-number`)
2. **Include Area in ID**: Include the media area in the placeholder ID when possible (e.g., `hero-background`, `article-thumbnail`)
3. **Use the Media Hooks**: Always use the provided hooks to access media assets, rather than hardcoding URLs
4. **Regenerate the Media Map**: Regenerate the media map when adding new components or pages that use media assets
5. **Sync After Generation**: After generating a new media map, sync the placeholders to Supabase

## Troubleshooting

### Media Not Displaying

1. Check if the placeholder ID exists in the media map
2. Verify that a Cloudinary asset is associated with the placeholder in the `media_assets` table
3. Ensure the Cloudinary public ID is correct and the asset exists in Cloudinary
4. Check for errors in the browser console

### Media Map Generation Issues

1. Ensure the patterns in `generate-media-map.js` match how you're using media placeholders in your code
2. Check for syntax errors in your components that might prevent proper scanning
3. Run the script with `--verbose` flag for more detailed output: `node scripts/generate-media-map.js --verbose` 