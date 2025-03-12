# Cloudinary Integration in FAL

This document provides a comprehensive guide to the unified Cloudinary integration in our application. It covers the utility functions, components, and best practices for working with Cloudinary assets.

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Runtime Considerations](#runtime-considerations)
4. [Utility Functions](#utility-functions)
5. [Components](#components)
6. [API Routes](#api-routes)
7. [Image Areas and Placements](#image-areas-and-placements)
8. [Best Practices](#best-practices)
9. [Media Management System](#media-management-system)
10. [Testing Your Implementation](#testing-your-implementation)
11. [Troubleshooting](#troubleshooting)
12. [Cloudinary Folder Organization](#cloudinary-folder-organization)

## Overview

Our application uses Cloudinary for all media asset management. This includes:

- Images for heroes, articles, services, team members, galleries, and logos
- Videos for demonstrations, testimonials, and marketing materials
- Organized asset management with tags, folders, and collections

We've implemented a unified approach to Cloudinary integration to ensure consistency, performance, and maintainability across the application.

## Environment Configuration

To use Cloudinary in your application, you need to set up the proper environment variables:

```
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=preset
```

### Required Variables

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (publicly accessible).
- `CLOUDINARY_API_KEY`: Your Cloudinary API key (keep secure, server-side only).
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret (keep secure, server-side only).
- `CLOUDINARY_UPLOAD_PRESET`: An optional unsigned upload preset for client-side uploads.

### Configuration in the Application

The main Cloudinary configuration files in our application:

1. **Client-side configurations** (`lib/cloudinary.ts`):
   ```typescript
   const cloudinaryConfig = {
     cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
     apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
     uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
   };
   ```

2. **Server-side configurations** (`lib/cloudinary-server.ts`):
   ```typescript
   import { v2 as cloudinary } from 'cloudinary';

   // Only configure if we're on the server side
   if (typeof window === 'undefined') {
     cloudinary.config({
       cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
       api_key: process.env.CLOUDINARY_API_KEY,
       api_secret: process.env.CLOUDINARY_API_SECRET,
       secure: true,
     });
   }

   export default cloudinary;
   ```

### Troubleshooting Environment Issues

- If images fail to load, check that your `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correctly set.
- For upload failures, verify your API key, secret, and upload preset.
- For production deployments, ensure all environment variables are properly configured in your hosting platform.

## Runtime Considerations

When working with Cloudinary in Next.js, be aware of runtime differences between client, server, and edge environments:

### Node.js Runtime vs Edge Runtime

- **Node.js Runtime**: Provides full access to Node.js built-in modules like `http`, `https`, `crypto`, `stream`, etc.
- **Edge Runtime**: Lightweight runtime that doesn't support Node.js built-in modules.

### Considerations for API Routes

- **Node.js-dependent operations**: Use Node.js runtime for operations that require the Cloudinary SDK
- **Simple operations**: Use Edge runtime for lightweight operations that don't require Node.js modules

### Runtime Configuration

Configure the runtime for API routes using the `runtime` export:

```typescript
// For routes that use Cloudinary SDK features:
export const runtime = 'nodejs';

// For lightweight routes:
export const runtime = 'edge';
```

### Webpack Configuration

Our application includes necessary webpack configuration to handle Node.js modules in the browser:

```typescript
// next.config.ts
webpack: (config, { isServer }) => {
  // Handle Cloudinary Node.js dependencies
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
    };
  }
  return config;
}
```

## Utility Functions

All Cloudinary utility functions are centralized in the `lib/cloudinary.ts` file. Here are the main utility functions:

### URL Generation

```typescript
// Generate an optimized image URL
const imageUrl = getCloudinaryUrl('public-id', {
  width: 800,
  height: 600,
  crop: 'fill',
  gravity: 'auto'
});

// Generate a video URL
const videoUrl = getCloudinaryVideoUrl('video-public-id', {
  width: 720,
  format: 'mp4'
});
```

### Next.js Image Integration

```typescript
// Get optimized props for Next.js Image component
const imageProps = getCloudinaryImageProps('public-id', {
  width: 800,
  height: 600
});

// Generate a responsive srcSet
const srcSet = getCloudinaryImageSrcSet('public-id', [640, 750, 1080]);

// Generate video sources for different formats and resolutions
const videoSources = getCloudinaryVideoSources('video-public-id');
```

### Upload and Management

```typescript
// Upload a file to Cloudinary (client-side)
const result = await uploadToCloudinary(file, 'hero', 'services');

// Delete a file from Cloudinary (client-side)
await deleteFromCloudinary('public-id');

// Initialize the Cloudinary Upload Widget
initUploadWidget({
  folder: 'team/headshots',
  tags: ['team', 'staff'],
  cropping: true
}, (error, result) => {
  if (result.event === 'success') {
    console.log('Upload success:', result.info);
  }
});
```

### Server-side Operations

Our server-side operations are defined in `lib/cloudinary-server-actions.ts` as server actions:

```typescript
// Organize assets with tags, folders, and context
await organizeAssets({
  publicIds: ['asset1', 'asset2'],
  folder: 'team/headshots',
  tags: ['staff', 'headshot'],
  context: { alt: 'Team member photo' }
});

// Create a collection from a tag or folder
await createCollection('Staff Photos', 'staff');
```

## Components

We've created several reusable components for working with Cloudinary assets:

### CloudinaryImage

```tsx
// Basic usage
<CloudinaryImage 
  publicId="example" 
  alt="Example image" 
/>

// With area (using predefined dimensions)
<CloudinaryImage 
  publicId="example" 
  area="hero" 
  alt="Hero image" 
/>

// With custom options
<CloudinaryImage 
  publicId="example" 
  alt="Custom image" 
  options={{ width: 500, height: 300, crop: 'fill' }} 
  expandOnHover
/>
```

### CloudinaryVideo

```tsx
// Basic usage
<CloudinaryVideo 
  publicId="example" 
/>

// With custom options
<CloudinaryVideo 
  publicId="example" 
  options={{ width: 720, format: 'mp4' }}
  autoPlay
  loop
  muted
/>

// With custom thumbnail
<CloudinaryVideo 
  publicId="example"
  thumbnailOptions={{ publicId: "thumbnail-image" }}
/>
```

### CloudinaryUploader

```tsx
// Basic usage
<CloudinaryUploader 
  onSuccess={(asset) => console.log(asset)} 
/>

// Custom button
<CloudinaryUploader onSuccess={handleSuccess}>
  <Button>Upload Image</Button>
</CloudinaryUploader>

// Specific configuration for an image area
<CloudinaryUploader 
  area="team"
  folder="team/headshots"
  tags={["team", "headshot"]}
  cropping={true}
  croppingAspectRatio={3/4}
  onSuccess={handleSuccess}
/>
```

### MediaManagement

The MediaManagement component provides a comprehensive interface for browsing, organizing, and managing Cloudinary assets:

```tsx
// Basic usage
<MediaManagement />

// With selection mode for picking assets
<MediaManagement 
  selectionMode="single" 
  onSelect={(asset) => console.log(asset)} 
/>

// With specific configuration
<MediaManagement 
  initialArea="gallery"
  showUploadButton={true}
  uploadArea="gallery"
  uploadFolder="exhibition-2023"
  viewMode="grid"
  allowedResourceTypes={['image']}
/>
```

Key features:
- Asset browsing with grid and list views
- Filtering by area, resource type, folder, and tags
- Search functionality
- Bulk selection and operations (delete, organize)
- Asset editing with tag management
- Responsive and user-friendly design

## API Routes

We provide API routes for server-side Cloudinary operations:

### `/api/cloudinary/organize`

Handles asset organization with tags, folders, and collections. Uses Node.js runtime for Cloudinary SDK compatibility:

```typescript
// Organize assets
const response = await fetch('/api/cloudinary/organize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicIds: ['asset1', 'asset2'],
    folder: 'services',
    tags: ['featured', 'homepage']
  })
});

// Create a collection
const response = await fetch('/api/cloudinary/organize', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Featured Services',
    tag: 'featured'
  })
});
```

### `/api/cloudinary/assets`

Fetches assets with filtering, search, and pagination:

```typescript
// Fetch assets with filters
const response = await fetch('/api/cloudinary/assets?area=hero&resourceType=image&searchTerm=header');
const data = await response.json();
// data.assets - array of CloudinaryAsset objects
// data.hasMore - boolean indicating if more assets are available
// data.nextCursor - cursor for pagination
```

### `/api/cloudinary/organizers`

Gets available folders and tags for organization:

```typescript
const response = await fetch('/api/cloudinary/organizers');
const data = await response.json();
// data.folders - array of folder paths
// data.tags - array of tag names
```

### `/api/cloudinary/asset-usage`

Tracks and retrieves asset usage across the site:

```typescript
// Get usage information for an asset
const response = await fetch(`/api/cloudinary/asset-usage?publicId=${publicId}`);
const usageData = await response.json();
```

### `/api/cloudinary/folders`

Manages folder structure:

```typescript
// Get folder structure
const response = await fetch('/api/cloudinary/folders');
const folders = await response.json();
```

### `/api/cloudinary/duplicates`

Identifies and manages duplicate assets:

```typescript
// Find duplicate assets
const response = await fetch('/api/cloudinary/duplicates');
const duplicates = await response.json();
```

### `/api/cloudinary/signed-upload`

Generates signed upload parameters for secure client-side uploads:

```typescript
// Get signed upload parameters
const response = await fetch('/api/cloudinary/signed-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folder: 'uploads',
    tags: ['user-generated']
  })
});
const signatureData = await response.json();
```

## Image Areas and Placements

We've defined standard image areas with recommended dimensions and transformations:

| Area | Description | Dimensions | Aspect Ratio | Transformations |
|------|-------------|------------|--------------|----------------|
| hero | Main hero images | 1920×1080 | 16:9 | c_fill, g_auto, f_auto, q_auto |
| article | Article headers | 1200×675 | 16:9 | c_fill, g_auto, f_auto, q_auto |
| service | Service categories | 800×600 | 4:3 | c_fill, g_auto, f_auto, q_auto |
| team | Team headshots | 600×800 | 3:4 | c_fill, g_face, f_auto, q_auto |
| gallery | Gallery images | 800×600 | 4:3 | c_fill, g_auto, f_auto, q_auto |
| logo | Logos and branding | 200×auto | variable | c_scale, f_auto, q_auto |
| video-thumbnail | Video thumbnails | 1280×720 | 16:9 | c_fill, g_auto, f_auto, q_auto |

## Best Practices

1. **Use Components Instead of Direct URLs**: Always use the CloudinaryImage and CloudinaryVideo components instead of hardcoding Cloudinary URLs.

2. **Store Only Public IDs**: Store only the public ID in your database, not the full URL.

3. **Use Image Areas**: Assign appropriate image areas for consistent sizing and transformations.

4. **Organize with Tags and Folders**: Use a consistent tagging and folder structure.

5. **Responsive Images**: Use responsive options for optimal performance across devices.

6. **Lazy Loading**: The CloudinaryImage component supports lazy loading by default.

7. **Fallbacks**: Provide fallback images for error handling.

8. **Consider Runtime Environment**: Remember which runtime your API routes are using:
   - For operations needing the full Cloudinary SDK, use `export const runtime = 'nodejs'`
   - For lightweight operations, use `export const runtime = 'edge'`

9. **Limit Client-side API Calls**: Use the API routes for all operations that require authentication.

10. **Optimize for Performance**: Use format `auto` and quality `auto` for optimal compression.

11. **Bundle Size Optimization**: Use dynamic imports for Cloudinary-related code when possible.

12. **Use Next Cloudinary Library**: Consider using the `next-cloudinary` library for enhanced integration with Next.js Image component.

## Media Management System

Our media management system provides a complete solution for managing Cloudinary assets. It consists of:

### 1. MediaManagement Component

The `MediaManagement` component provides a user-friendly interface for:
- Browsing assets with filtering and search
- Organizing assets with tags, folders, and collections
- Uploading new assets
- Editing asset metadata
- Performing bulk operations (delete, tag, organize)

### 2. Cloudinary Media Library Widget Integration

We've integrated the official Cloudinary Media Library widget in our `/admin/media` page. This widget offers a comprehensive interface for:
- Browsing and searching your Cloudinary media assets
- Uploading new assets directly to Cloudinary
- Organizing assets with folders, tags, and collections
- Managing metadata and transformations
- Performing bulk operations

To integrate the Media Library widget, we use Cloudinary's official JavaScript SDK:

```javascript
// Initialize the Media Library widget
const mediaLibrary = cloudinary.createMediaLibrary({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  multiple: true,
  max_files: 10,
  folder: {
    path: 'folder/path',  // Optional starting folder
    resource_type: 'image' // Optional filter by resource type
  }
}, {
  insertHandler: function(data) {
    // Handle selected assets
    console.log('Selected assets:', data.assets);
  }
});

// Open the Media Library widget
mediaLibrary.show();
```

Configuration options include:
- Selection mode (single/multiple)
- Resource filtering
- Custom folder navigation
- UI customization
- Upload presets
- Authentication and access control

### 3. API Endpoints

- `/api/cloudinary/assets` - Fetches assets with filtering, search, and pagination
- `/api/cloudinary/organizers` - Gets available folders and tags
- `/api/cloudinary/organize` - Handles asset organization (uses Node.js runtime)

### 4. Admin Integration

The media management system is integrated into the admin dashboard at `/admin/media`, providing a complete solution for managing media assets.

## Testing Your Implementation

To test your Cloudinary integration, follow these steps:

### 1. Test the Media Management Interface

Navigate to `/admin/media` to access the media management interface. This page should display your Cloudinary assets with options to filter, search, and organize them.

### 2. Test Asset Browsing

1. Try filtering assets by:
   - Area (hero, gallery, team, etc.)
   - Resource type (image, video)
   - Folder
   - Tag

2. Use the search box to find specific assets by name.

3. Test both grid and list views.

### 3. Test Asset Upload

1. Click the "Upload" button.
2. Use the upload widget to select and upload files.
3. Apply tags and organize assets during upload.
4. Confirm that the uploaded assets appear in the media library.

### 4. Test Asset Organization

1. Select one or more assets.
2. Use the "Organize" dropdown to:
   - Move assets to a different folder
   - Add tags to assets

3. Edit an asset's details:
   - Update alt text
   - Manage tags

### 5. Test Components in Your Application

1. Test the CloudinaryImage component:
   ```tsx
   <CloudinaryImage 
     publicId="example" 
     alt="Example image" 
     options={{ width: 500, height: 300 }} 
   />
   ```

2. Test the CloudinaryVideo component:
   ```tsx
   <CloudinaryVideo 
     publicId="example-video" 
     controls 
   />
   ```

3. Test the CloudinaryUploader component:
   ```tsx
   <CloudinaryUploader 
     onSuccess={(asset) => console.log(asset)} 
     area="gallery"
   />
   ```

### 6. Test API Endpoints

You can test the API endpoints using your browser's developer tools or a tool like Postman:

1. Test fetching assets:
   ```
   GET /api/cloudinary/assets?area=gallery&resourceType=image
   ```

2. Test organizing assets:
   ```
   POST /api/cloudinary/organize
   {
     "publicIds": ["example1", "example2"],
     "tags": ["featured"]
   }
   ```

3. Test fetching organizers:
   ```
   GET /api/cloudinary/organizers
   ```

### Common Issues and Troubleshooting

1. **Upload Failures**: Check your Cloudinary credentials and upload preset configuration.
2. **Missing Images**: Verify the public ID is correct and the asset exists in your Cloudinary account.
3. **Performance Issues**: Ensure you're using appropriate transformations and optimizations.
4. **CORS Errors**: Check your Cloudinary CORS configuration if you encounter cross-origin issues.
5. **Runtime Errors**: If you encounter errors related to missing Node.js modules, check the runtime configuration of your API routes.

## Troubleshooting

Here are solutions for common issues you might encounter when working with Cloudinary:

### Image Loading Issues

1. **Images Not Loading**
   - Check your `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correctly set
   - Verify the publicId is correct (including folder structure)
   - Ensure you're using the correct format (e.g., `publicId="services/dermatology/image"` not `publicId="services-dermatology-image"`)
   - Check the browser console for errors

2. **Broken Images After Migration**
   - Make sure you've run the migration scripts completely
   - Check for typos in folder paths or publicIds
   - Use the `CloudinaryImage` component with proper error handling

3. **Slow Loading Images**
   - Ensure you're using appropriate transformations (width/height)
   - Add format and quality parameters (f_auto, q_auto)
   - Consider implementing responsive sizing with srcset

### Upload Issues

1. **Upload Failures**
   - Verify your API key and secret are correct
   - Check that your upload preset exists and is properly configured
   - Ensure the file size is within limits
   - Look for CORS issues if uploading from the browser

2. **Wrong Folder Uploads**
   - Confirm folder paths in upload configuration
   - Ensure folders exist in Cloudinary before uploading

3. **Duplicate Assets**
   - Use the `use_filename` parameter to maintain original filenames
   - Consider enabling `unique_filename: false` for more predictable names

### Component Issues

1. **CloudinaryImage Errors**
   - Check for missing required props (publicId, alt)
   - Verify the import path is correct (`import { CloudinaryImage } from '@/components/CloudinaryImage'`)
   - Ensure you're passing options correctly

2. **Placeholder/Blur Issues**
   - Verify that blurDataURL is being generated
   - Check that placeholder="blur" is correctly set

### API Route Issues

1. **Module Not Found Errors**
   - Check if the API route is using the correct runtime (`nodejs` vs `edge`)
   - For routes using Cloudinary SDK features, ensure `export const runtime = 'nodejs'`
   - Verify webpack config includes proper fallbacks for client-side

2. **Authentication Errors**
   - Ensure your Cloudinary credentials are properly set in environment variables
   - Check that the server-side configuration is loading correctly

### Common Error Messages

1. **"Resource not found"**
   - The publicId doesn't exist in your Cloudinary account
   - Check for typos in the publicId
   - Verify the asset exists in the specified folder

2. **"Invalid transformation"**
   - Review your transformation parameters
   - Ensure you have access to the specified transformations in your plan

3. **"Missing required parameter"**
   - Check that all required props are provided to components
   - Verify API calls include necessary parameters

4. **"Cannot find module 'http', 'https', 'crypto', etc."**
   - Change the API route runtime from 'edge' to 'nodejs'
   - These errors occur when trying to use Node.js built-in modules in Edge Runtime

### Debugging Tips

1. **Use the Cloudinary URL Debugger**
   - Log the full URL being generated (`console.log(getCloudinaryUrl(publicId, options))`)
   - Test the URL directly in the browser

2. **Check Network Requests**
   - Use browser dev tools to inspect image requests
   - Look for 4xx or 5xx errors in the Network tab

3. **Component Debugging**
   - Add console logs to component lifecycle methods
   - Use the React DevTools to inspect props and state

4. **API Route Debugging**
   - Add logging to your API routes
   - Check the runtime environment variables are available

## Cloudinary Folder Organization

Proper folder organization is critical for efficiently managing your media assets. Our application uses two main approaches to folder structure:

### URL-Based Structure

The recommended approach is to mirror your website's URL structure in your Cloudinary folders. This makes it easy to find images for specific pages:

```
/services/dermatology/
/services/plastic-surgery/
/services/medical-spa/
/about/team/
/gallery/before-after/
```

### Content Type Structure

Alternatively, you can organize by content type, which is useful for reusable assets:

```
/hero-banners/
/team-members/
/services/
/galleries/
```

### Guidelines for Folder Organization

1. **Avoid Duplicate Folders**: Do not create similarly named folders like `services-dermatology` and `services/dermatology`. Use one consistent pattern.

2. **Use Hierarchical Structure**: Prefer `/services/dermatology/` over flatter structures like `/services-dermatology/`.

3. **Consistent Naming Conventions**: Use kebab-case for folder names (e.g., `team-members` instead of `team_members` or `TeamMembers`).

4. **Limit Nesting Depth**: Keep folder nesting to 3-4 levels maximum for better manageability.

5. **Public ID Prefix Conventions**: When referencing images, use the full path as the public ID:
   ```tsx
   // For an image in the /services/dermatology/ folder
   <CloudinaryImage publicId="services/dermatology/acne-treatment" alt="Acne Treatment" />
   ```

6. **Shared Resource Folders**: Create a `/common/` or `/shared/` folder for assets used across multiple sections.

### Recommended Folder Structure

```
/hero/                       # Main hero banners
  /homepage/
  /services/
  /about/
/services/                   # All service-related images
  /dermatology/
  /plastic-surgery/
  /medical-spa/
/team/                       # Team member photos
  /doctors/
  /staff/
/gallery/                    # Gallery images
  /before-after/
  /treatments/
/common/                     # Shared resources
  /logos/
  /icons/
  /backgrounds/
```

### Transitioning from a Disorganized Structure

If you need to reorganize your Cloudinary folders:

1. Create the new folder structure first
2. Upload new assets to the correct folders
3. Move existing assets to the proper folders using the Cloudinary Media Library or API
4. Update references in your code to the new public IDs
5. Use the migration scripts to ensure all references are updated

Remember to keep your local development environment in sync with your production Cloudinary setup by using consistent folder structures across environments. 