# Cloudinary Migration Plan

This document outlines the comprehensive plan to align our local directory structure with Cloudinary, creating a perfect 1:1 mapping that will ensure consistent media references throughout the application.

## Current Issues

1. **Inconsistent Path Structure**: 
   - Some components use direct Cloudinary URLs
   - Others use short IDs without full paths
   - Some use prefixes like `page:` or incomplete paths

2. **Missing Directory Structure Alignment**:
   - Cloudinary folders don't match our local folders
   - No clear pattern for where images should be uploaded

3. **Incomplete Media Registry**:
   - No central reference for available media assets
   - Developers must guess at available paths

## Migration Strategy

### Phase 1: Structure Alignment

1. **Execute the `align-cloudinary-structure.js` script**
   ```bash
   node scripts/align-cloudinary-structure.js
   ```
   
   This script will:
   - Map local directories to Cloudinary paths
   - Create missing folders in Cloudinary
   - Find local media files and identify which ones need uploading
   - Upload missing files to Cloudinary
   - Generate a media registry file

2. **Review and verify the structure**
   - Examine the generated registry file
   - Check for any errors or missing assets

### Phase 2: Component Reference Updates

1. **Execute the `update-component-paths.js` script**
   ```bash
   node scripts/update-component-paths.js
   ```
   
   This script will:
   - Find all component references to CloudinaryImage/CloudinaryVideo
   - Update paths to use the full standardized format
   - Handle various legacy formats (page:, component:, etc.)

2. **Verify component updates**
   - Restart the application
   - Check that all images load correctly
   - Fix any remaining path issues manually

### Phase 3: Documentation and Standards

1. **Review the generated media reference guide**
   ```
   docs/media-reference-guide.md
   ```
   
   This document contains:
   - A complete list of all media assets and their Cloudinary paths
   - Usage examples for different component types
   - Best practices for referencing media

2. **Implement ongoing standards**
   - All new media should be first placed in the appropriate local folder
   - Images should be uploaded to Cloudinary using the same path structure
   - Components should always use full paths (`fal/pages/services/...`)

## Migration Benefits

1. **Consistency**: All media references will follow the same pattern
2. **Maintainability**: Clear 1:1 mapping between local and Cloudinary files
3. **Developer Experience**: Easier to find and reference media assets
4. **Performance**: Properly optimized images with consistent delivery

## Future Maintenance

After the migration, follow these best practices:

1. **New Media Assets**
   - Place images in the appropriate local folder:
     ```
     public/images/pages/services/plastic-surgery/[category]/[procedure].jpg
     ```
   - Upload to Cloudinary with the same path structure:
     ```
     fal/pages/services/plastic-surgery/[category]/[procedure]
     ```

2. **Component References**
   - Always use the full Cloudinary path in the `id` prop:
     ```jsx
     <CloudinaryImage
       id="fal/pages/services/plastic-surgery/body/tummy-tuck"
       alt="Tummy Tuck Procedure"
       fill
       width={800}
       height={600}
       className="object-cover"
     />
     ```

3. **Directory Structure Updates**
   - When adding new directories locally, ensure they're mirrored in Cloudinary
   - Run the alignment script again if needed to update the structure

## Troubleshooting

If images aren't appearing correctly after migration:

1. **Check the browser console** for 404 errors on Cloudinary URLs
2. **Verify the path** matches exactly between your component and Cloudinary
3. **Run the alignment script again** to ensure all assets are uploaded
4. **Clear your browser cache** to ensure you're seeing the latest changes

## Reference

For more details on our media system design, see the comprehensive [Media System Documentation](../.cursor/@docs/media-system-documentation.md). 