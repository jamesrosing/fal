# Allure MD Media System

This document provides an overview of the media system in the Allure MD project, including the recent fixes and improvements made to address issues with media handling.

## Overview

The Allure MD website uses a unified media system based on Cloudinary for storing and serving optimized images and videos. The system consists of:

1. **Media Registry**: A centralized registry of all media assets used in the application
2. **Optimized Components**: React components that use the registry to display media
3. **Utilities**: Helper functions for generating media URLs and handling errors

## Recent Fixes

The following issues have been addressed:

1. **Empty Image Registry**: The `image-config.js` file has been populated with all media assets from Cloudinary.
2. **Error Handling**: Improved error handling in the media components to provide better fallbacks.
3. **Component Migration**: Added scripts to migrate hardcoded URLs to the new optimized components.
4. **Debugging Tools**: Added debugging information to help diagnose media issues.

## Media System Architecture

### 1. Media Registry (`lib/image-config.js`)

This file contains a registry of all media assets used in the application, with the following properties:

- `id`: Unique identifier for the asset
- `type`: Type of asset ('image' or 'video')
- `area`: Area of the application where the asset is used (e.g., 'hero', 'article')
- `description`: Human-readable description of the asset
- `publicId`: Cloudinary public ID for the asset
- `dimensions`: Width, height, and aspect ratio
- `defaultOptions`: Default transformation options

### 2. Media Utilities (`lib/media/utils.js`)

Key utility functions:

- `getMediaUrl(id, options)`: Generates a Cloudinary URL with transformations
- `getNextImageProps(id, options)`: Gets all props needed for Next.js Image component
- `getVideoSources(id, options)`: Gets sources for different video formats and resolutions
- `getMediaType(id)`: Detects media type from ID or URL

### 3. Optimized Components

- `OptimizedImage`: Enhanced Image component with error handling and debugging
- `OptimizedVideo`: Enhanced Video component with error handling and debugging

## Usage Guidelines

### Using Images

```jsx
import OptimizedImage from '@/components/media/OptimizedImage';

// Basic usage
<OptimizedImage id="hero-image" alt="Hero section" />

// With options
<OptimizedImage 
  id="article-header" 
  alt="Article header"
  width={800}
  height={600}
  options={{
    crop: 'fill',
    gravity: 'center'
  }}
/>

// With fallback
<OptimizedImage 
  id="team-member" 
  alt="Team member"
  fallbackSrc="/images/placeholder-person.jpg"
/>

// With debugging (development only)
<OptimizedImage 
  id="logo" 
  alt="Company logo"
  showDebugInfo={process.env.NODE_ENV === 'development'}
/>
```

### Using Videos

```jsx
import OptimizedVideo from '@/components/media/OptimizedVideo';

// Basic usage
<OptimizedVideo id="hero-video" />

// With options
<OptimizedVideo 
  id="product-demo" 
  options={{
    autoPlay: true,
    muted: true,
    loop: true,
    controls: false
  }}
/>

// With poster image
<OptimizedVideo 
  id="testimonial" 
  posterImageId="testimonial-poster"
/>
```

## Maintaining the Media System

### Adding New Assets

1. Upload assets to Cloudinary using the admin interface
2. Register the assets in `lib/image-config.js`:

```javascript
// Example new asset
"new-asset-id": {
  "id": "new-asset-id",
  "type": "image",
  "area": "hero",
  "description": "New hero image",
  "publicId": "hero/new-asset",
  "dimensions": {
    "width": 1200,
    "height": 800,
    "aspectRatio": 1.5
  },
  "defaultOptions": {
    "width": 1200,
    "quality": 90,
    "format": "auto"
  }
}
```

### Scripts for Media Management

The following scripts are available to help manage media:

1. **Verify Media Assets**: Check that all registered assets are accessible
   ```
   node scripts/verify-image-registry.js
   ```

2. **Migrate Hardcoded URLs**: Replace hardcoded Cloudinary URLs with optimized components
   ```
   node scripts/migrate-hardcoded-urls.js
   ```

3. **Scan for Unmigrated Components**: Find components that still use standard Image tags
   ```
   node scripts/scan-unmigrated-components.js
   ```

### Debugging Media Issues

If you encounter issues with media display:

1. Enable debug info on the component:
   ```jsx
   <OptimizedImage id="problematic-image" showDebugInfo={true} />
   ```

2. Check the browser console for warning and error messages

3. Verify that the asset is properly registered in `lib/image-config.js`

4. Check that the Cloudinary URL is accessible via `https://res.cloudinary.com/dyrzyfg3w/image/upload/[publicId]`

## Best Practices

1. **Use IDs, not URLs**: Always reference media by their ID, not by URL
2. **Provide Fallbacks**: Use the `fallbackSrc` prop for important images
3. **Set Dimensions**: Always provide `width` and `height` for better page layout
4. **Use Appropriate Areas**: Organize assets by area for better management
5. **Run Verification**: Regularly run the verification script to check for broken assets