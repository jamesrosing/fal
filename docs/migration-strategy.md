# Migration Strategy: Custom Cloudinary to next-cloudinary

This document outlines the strategy for migrating the existing custom Cloudinary implementations to the new next-cloudinary wrappers.

## Components to Replace

The following components should be gradually replaced:

1. `CloudinaryImage` → `CldImageWrapper`
2. `CloudinaryVideo` → `CldVideoWrapper`
3. `CloudinaryMediaLibrary` → `CldMediaLibrary` and `CldUploadWidgetWrapper`

## Migration Approach

### Phase 1: Side-by-Side Implementation (Current Phase)

- ✅ Create the wrapper components (`CldImageWrapper`, `CldVideoWrapper`, etc.)
- ✅ Create an example page to test the new components 
- ✅ Add Schema.org support for images and videos
- ✅ Create browser component to explore available assets
- ✅ Create API endpoint to access Cloudinary resources
- ✅ Update documentation with usage examples
- ✅ Add fallback handling for missing assets

### Phase 2: Gradual Replacement (Next Phase)

- Identify all locations where the old components are used
- Replace them one by one, prioritizing high-traffic pages
- Test each replacement thoroughly
- Update imports and component props as needed
- Ensure all image areas and presets work correctly

### Phase 3: Cleanup (Final Phase)

- Remove the old Cloudinary components once all uses have been migrated
- Update documentation to remove references to old components
- Audit the codebase for any missed occurrences
- Optimize performance of the new components

## Key Implementation Details

### CldImageWrapper

This component wraps the next-cloudinary `CldImage` component with:

- Support for all standard props from next-cloudinary
- Smart defaults for image sizing and loading
- Support for area-based presets (e.g., "team", "gallery")
- Error handling with fallback images
- Hover effects for interactive elements
- Full Schema.org support

### CldVideoWrapper

This component wraps the next-cloudinary `CldVideoPlayer` component with:

- Support for responsive dimensions
- Customizable controls and autoplay
- Error handling with fallbacks
- Event callbacks for various video states

### Media Library and Upload Components

- `CldMediaLibrary`: Provides a button to open the Cloudinary Media Library for selecting existing assets
- `CldUploadWidgetWrapper`: Provides a button to open the Cloudinary Upload Widget for uploading new assets

## Asset Browser

A new `CloudinaryBrowser` component has been implemented to help developers:

- Browse available folders and assets in Cloudinary
- View asset details such as dimensions, format, and public ID
- Generate component code snippets based on selected assets
- Test the rendering of assets using the new components

## Testing & Validation

Test the components at: [http://localhost:3000/example/cloudinary-examples](http://localhost:3000/example/cloudinary-examples)

This page includes:
- Asset Browser for exploring your Cloudinary account
- Component examples demonstrating proper usage
- Upload and media library widgets for testing

## Environment Variables Required

Make sure these environment variables are set:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: API key for Cloudinary access (server-side)
- `CLOUDINARY_API_SECRET`: API secret for Cloudinary access (server-side)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Upload preset to use (e.g., "emsculpt")

## Component Mapping Guide

### CloudinaryImage → CldImageWrapper

```tsx
// OLD
<CloudinaryImage
  publicId="folder/image-id"
  alt="Image description"
  width={600}
  height={400}
  priority={true}
  className="custom-class"
/>

// NEW
<CldImageWrapper
  publicId="folder/image-id"
  alt="Image description"
  width={600}
  height={400}
  priority={true}
  className="custom-class"
/>
```

### CloudinaryVideo → CldVideoWrapper

```tsx
// OLD
<CloudinaryVideo
  publicId="folder/video-id"
  width={800}
  height={450}
  autoPlay
  loop
  muted
  controls={false}
  className="custom-class"
/>

// NEW
<CldVideoWrapper
  publicId="folder/video-id"
  width={800}
  height={450}
  autoPlay
  loop
  muted
  controls={false}
  className="custom-class"
/>
```

### Upload Widget and Media Library

```tsx
// OLD - Upload Widget
<CloudinaryUploadWidget
  onUpload={handleUpload}
  folder="uploads"
  tags={['custom-tag']}
>
  <Button>Upload</Button>
</CloudinaryUploadWidget>

// NEW - Upload Widget
<CldUploadWidgetWrapper
  onUpload={handleUpload}
  options={{
    folder: 'uploads',
    tags: ['custom-tag']
  }}
  buttonText="Upload"
/>

// OLD - Media Library
<CloudinaryMediaLibrary
  onSelect={handleSelect}
  resourceType="image"
>
  <Button>Select from Library</Button>
</CloudinaryMediaLibrary>

// NEW - Media Library
<CldMediaLibrary
  onSelect={handleSelect}
  supportedFileTypes={['image']}
  buttonText="Select from Library"
/>
```

## Testing Checklist

For each component replacement, verify:

- [ ] Visual appearance is unchanged
- [ ] Responsive behavior is maintained
- [ ] Loading states work correctly
- [ ] Error states and fallbacks function properly
- [ ] Interactions (hover effects, click actions) still work
- [ ] Performance is the same or better

## Benefits Expected

1. **Simpler Codebase**: Leveraging next-cloudinary's built-in optimizations
2. **Better Performance**: Using CldImage's automatic optimizations and lazy-loading
3. **Easier Updates**: Component behavior will be maintained by next-cloudinary updates
4. **Improved SEO**: Better alt text handling and proper image dimensions
5. **Server Component Support**: Easier integration with Next.js app router
6. **Better TypeScript Support**: Improved type definitions from the library 