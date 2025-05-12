# Direct Cloudinary Usage Guide

This guide explains how to use the standard Cloudinary components in the application.

## Using Our Standard Cloudinary Components

We use enhanced components from `@/components/media` that wrap the standard `next-cloudinary` library:

### CldImage Component

```jsx
import { CldImage } from '@/components/media';

// Basic usage
<CldImage
  publicId="folder/image-name" // Cloudinary public ID
  width={800}
  height={600}
  alt="Image description"
/>

// With transformations
<CldImage
  publicId="folder/image-name"
  width={800}
  height={600}
  alt="Image description"
  crop="fill"
  gravity="auto"
  quality="auto"
/>

// Responsive usage
<CldImage
  publicId="folder/image-name"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Image description"
/>
```

### CldVideo Component

```jsx
import { CldVideo } from '@/components/media';

// Basic usage
<CldVideo
  publicId="folder/video-name" // Cloudinary public ID
  width={800}
  height={600}
  controls
/>

// With options
<CldVideo
  publicId="folder/video-name"
  width={800}
  height={600}
  controls
  autoPlay
  loop
  muted
  transformation={[{
    quality: "auto",
    crop: "fill"
  }]}
/>
```

### MediaAdapter

For components that need to handle both images and videos:

```jsx
import { MediaAdapter } from '@/components/media';

<MediaAdapter
  mediaType="image" // or "video"
  publicId="folder/media-name"
  alt="Description"
  width={800}
  height={600}
/>
```

### CldUploadWidget

For uploading assets to Cloudinary:

```jsx
import { CldUploadWidget } from '@/components/media';

<CldUploadWidget
  onSuccess={(result) => {
    console.log(result.info.public_id);
  }}
/>
```

## New API Endpoints

### Asset Retrieval

```
GET /api/cloudinary/asset/[publicId]
```

Retrieves asset information by Cloudinary public ID. The `publicId` should be URL-encoded, with slashes replaced by the pipe character (`|`).

Example:
```javascript
// Get asset with public ID "folder/image-name"
const encodedId = encodeURIComponent("folder/image-name").replace(/\//g, '|');
const response = await fetch(`/api/cloudinary/asset/${encodedId}`);
const data = await response.json();
```

### Responsive Images

```
GET /api/cloudinary/responsive/[publicId]
```

Generates responsive image URLs for different screen sizes.

Example:
```javascript
const encodedId = encodeURIComponent("folder/image-name").replace(/\//g, '|');
const response = await fetch(`/api/cloudinary/responsive/${encodedId}?width=1200&quality=80`);
const data = await response.json();
// data.sizes contains URLs for different sizes
```

### Transformations

```
POST /api/cloudinary/transform
```

Apply transformations to an image or video.

Example:
```javascript
const response = await fetch('/api/cloudinary/transform', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    publicId: "folder/image-name",
    transformations: {
      width: 800,
      height: 600,
      crop: "fill",
      gravity: "auto",
      quality: 80
    }
  })
});
const data = await response.json();
// data.url contains the transformed URL
```

### Asset Registration

```
POST /api/cloudinary/assets/register
```

Register or update metadata for a Cloudinary asset:

```javascript
fetch('/api/cloudinary/assets/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    public_id: 'folder/image-name',
    title: 'My Image',
    alt_text: 'Description for accessibility',
    width: 1200,
    height: 800,
    metadata: { custom: 'data' }
  })
});
```

### Asset Listing

```
GET /api/cloudinary/assets/list
```

List all registered Cloudinary assets with optional filtering:

```javascript
fetch('/api/cloudinary/assets/list?type=image&limit=20&page=1')
  .then(res => res.json())
  .then(data => {
    // data.mediaAssets contains the list
    // data.pagination contains pagination info
  });
```

## Migration Process

To migrate from placeholder IDs to direct Cloudinary usage:

1. Use the migration scripts in `scripts/cloudinary-migration/`
2. Replace `<UnifiedMedia placeholderId="xyz" />` with `<CldImage publicId="actual/path" />`
3. Update API calls from `/api/media/...` to `/api/cloudinary/asset/...`

During the transition, you can use the legacy bridge endpoint:

```
GET /api/cloudinary/legacy-bridge?placeholderId=xyz
```

This endpoint looks up the Cloudinary public ID for a placeholder and redirects to the proper asset.

## Best Practices

1. **Always use our components from `@/components/media`** rather than importing directly from 'next-cloudinary'
2. **Use direct Cloudinary public IDs** in new code rather than placeholders
3. **Encode public IDs in API calls** - Replace slashes with pipes when calling APIs
4. **Use responsive settings** where appropriate for optimal performance
5. **Use proper image dimensions** to avoid layout shifts
6. **Include alt text** for accessibility

## Example Implementation

See the working examples at:
- `/app/example/cloudinary-examples/page.tsx`
- `/components/example/CloudinaryExample.tsx`