# Media Placement System

This document describes the media placement system implemented in the application, which allows for dynamic management of media assets across the site.

## Overview

The media placement system uses Cloudinary for media storage and Supabase for storing the mapping between placeholder IDs and Cloudinary public IDs. This allows for a flexible and scalable approach to managing media assets.

## Components

### 1. Media Utilities (`lib/media-utils.ts`)

Provides functions for interacting with media assets in Supabase:

- `getMediaPublicId(placeholderId)`: Fetches a Cloudinary public ID from Supabase based on a placeholder ID
- `getMediaPublicIds(placeholderIds)`: Fetches multiple Cloudinary public IDs from Supabase
- `updateMediaAsset(placeholderId, cloudinaryId, metadata)`: Updates or creates a media asset mapping in Supabase
- `deleteMediaAsset(placeholderId)`: Deletes a media asset mapping from Supabase

### 2. Cloudinary Admin Utilities (`lib/cloudinary-admin.ts`)

Provides functions for working with the Cloudinary Admin API:

- `fetchCloudinaryAssets(folder)`: Fetches all Cloudinary assets recursively
- `organizeAssetsByFolder(assets, folders)`: Organizes Cloudinary assets into a folder structure
- `filterAssetsByType(assets, type)`: Filters Cloudinary assets by type
- `searchAssets(assets, query)`: Searches Cloudinary assets by name

### 3. Media Components

#### Client Component (`components/ui/media-image.tsx`)

A client component for displaying Cloudinary images with client-side fetching:

```jsx
import { MediaImage } from '@/components/ui/media-image';

// Using with a placeholder ID (will fetch from Supabase)
<MediaImage
  placeholderId="home-hero"
  alt="Home Hero"
  width={1200}
  height={600}
/>

// Using with a direct public ID
<MediaImage
  publicId="hero/home-hero"
  alt="Home Hero"
  width={1200}
  height={600}
/>
```

#### Cloudinary Browser Component (`components/ui/cloudinary-browser.tsx`)

A component for browsing and selecting Cloudinary assets:

```jsx
import { CloudinaryBrowser } from '@/components/ui/cloudinary-browser';
import { CloudinaryAsset } from '@/lib/cloudinary-admin';

// Using the browser component
<CloudinaryBrowser
  resourceType="image" // 'image', 'video', or 'all'
  initialFolder="" // Start in a specific folder
  onSelect={(asset: CloudinaryAsset) => {
    // Handle asset selection
    console.log('Selected asset:', asset.public_id);
  }}
/>
```

### 4. API Routes

#### Media API (`app/api/media/route.ts`)

- `GET /api/media?placeholderId=home-hero`: Fetches a single media asset
- `GET /api/media?placeholderIds=home-hero,about-hero`: Fetches multiple media assets
- `POST /api/media`: Updates a media asset

#### Media Assets API (`app/api/media/assets/route.ts`)

- `GET /api/media/assets`: Fetches all media assets

#### Cloudinary Assets API (`app/api/cloudinary/fetch-assets/route.ts`)

- `GET /api/cloudinary/fetch-assets?folder=optional/folder/path`: Recursively fetches Cloudinary assets

### 5. Admin Interface (`app/admin/media/page.tsx`)

Provides a user interface for managing media assets:

- View all media assets
- Upload new media assets
- Replace existing media assets
- Search for media assets
- Browse existing Cloudinary assets

## Database Schema

The media placement system uses a single table in Supabase:

### `media_assets` Table

- `placeholder_id`: The ID of the placeholder (primary key)
- `cloudinary_id`: The Cloudinary public ID
- `uploaded_at`: The timestamp when the asset was uploaded
- `uploaded_by`: The user who uploaded the asset
- `metadata`: Additional metadata for the asset (JSON)

## Usage

### Adding a New Media Placeholder

1. Identify the placeholder ID for the new media asset
2. Add the placeholder ID to the admin interface
3. Upload a media asset for the placeholder

### Displaying Media in Components

Use the standard Next.js Image component with a direct path to your images:

```jsx
import Image from 'next/image';

<Image
  src="/images/home-hero.jpg" // Use a direct path to your image
  alt="Home Hero"
  width={1920}
  height={1080}
  className="object-cover"
  priority
  fill
/>
```

Use the `MediaImage` component for client-side rendering:

```jsx
<MediaImage
  placeholderId="home-hero"
  alt="Home Hero"
  width={1200}
  height={600}
/>
```

### Browsing Cloudinary Assets

Use the `CloudinaryBrowser` component to browse and select Cloudinary assets:

```jsx
<CloudinaryBrowser
  resourceType="image"
  onSelect={(asset) => {
    console.log('Selected asset:', asset.public_id);
  }}
/>
```

### Seeding Media Assets

Use the seed script to add initial media assets:

```bash
npm run seed-media
```

## Recursive Cloudinary Asset Fetching

The system includes a recursive Cloudinary asset fetching feature that allows you to browse and select assets from your Cloudinary account. This feature:

1. Recursively fetches all assets and folders from Cloudinary
2. Organizes assets by folder
3. Provides a user interface for browsing and selecting assets
4. Supports filtering by resource type (image, video, all)
5. Supports searching by asset name

This feature is implemented using the Cloudinary Admin API, which requires your Cloudinary API key and secret. Make sure these are properly configured in your environment variables:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Best Practices

1. **Use Descriptive Placeholder IDs**: Use descriptive placeholder IDs that reflect the purpose and location of the media asset.
2. **Optimize Images**: Use Cloudinary's transformation capabilities to optimize images for different devices and screen sizes.
3. **Use Fallbacks**: Always provide fallback images for cases where the media asset is not found.
4. **Validate Media Types**: Ensure that the media type (image, video) matches the expected type for the placeholder.
5. **Use Server Components**: Use server components for media that doesn't need client-side interactivity to reduce client-side JavaScript.
6. **Organize Cloudinary Assets**: Keep your Cloudinary assets organized in folders to make them easier to find and manage. 