# Active Context: Next-Cloudinary Implementation and Media System Migration

## Current Focus

We're currently migrating the project from custom Cloudinary implementations to standard next-cloudinary components, while fixing errors in the process. Current focus areas include:

1. **Next-Cloudinary Components Implementation**
   - ✅ Created CldImage component as a wrapper around next-cloudinary's CldImage
   - ✅ Created CldVideo component as a wrapper around next-cloudinary's CldVideoPlayer
   - ✅ Created CldImageWrapper and CldVideoWrapper components for backward compatibility
   - ✅ Created CldUploadWidget and CldMediaLibrary components
   - ✅ Fixed prop validation in CldImage and CldVideo components
   - ✅ Fixed homepage component issues using the new components
   - Next steps: Continue migrating other sections of the site to use the new components

2. **Media Source Resolution**
   - ✅ Enhanced the placeholder ID resolution API for better error handling
   - ✅ Added fallback mappings for common missing placeholders
   - ✅ Implemented getCloudinaryPublicId utility to extract public IDs from URLs
   - ✅ Added dynamic publicId fetching in components that previously used placeholderIds
   - Next steps: Complete the migration of remaining components to use direct Cloudinary public IDs

3. **SEO Optimizations**
   - Continuing to implement structured data for key pages
   - Optimizing meta descriptions and titles for procedure pages
   - Implementing OG images for improved social sharing

## Recent Decisions

- **Migration to next-cloudinary**: We've decided to migrate from custom Cloudinary implementation to the standard next-cloudinary components, which provide better optimization and maintenance.
- **Component Architecture**: Created wrapper components (CldImage, CldVideo) around the next-cloudinary components to provide enhanced functionality like loading states and error handling.
- **Width/Height vs. Fill**: Resolved conflicts between "width/height" and "fill" properties by standardizing on width/height properties in all CldImage components to prevent Next.js errors.
- **Backward Compatibility**: Implemented a hybrid approach where components can use both direct publicIds and legacy placeholderIds, with automatic fetching of publicIds when only placeholderIds are provided.

## Key Challenges

1. **Component Prop Compatibility**: 
   - CldImage doesn't support the "fill" property like Next.js Image
   - CldVideo doesn't support the "poster" property in the same way as standard HTML video
   - Solution: Modified component props and styling to achieve the same visual result

2. **Missing Placeholder Mappings**: 
   - Several placeholderIds in the codebase were returning 404 errors (e.g., homepage-about-background)
   - Solution: Set default publicIds and implemented API fetching with fallbacks

3. **Cloudinary URL Structure**:
   - Ensuring correct URL construction for various Cloudinary resources
   - Implemented getCloudinaryPublicId utility to properly extract public IDs from URLs

## Next Steps

1. **Continue Migration**:
   - Identify and update remaining components that use the old Cloudinary implementation
   - Standardize on the new CldImage and CldVideo components across the site

2. **Performance Analysis**: 
   - Analyze performance with Lighthouse after implementing next-cloudinary
   - Ensure Core Web Vitals remain strong after the migration

3. **Documentation**: 
   - Update component documentation to highlight the new system
   - Create examples for developers to follow when implementing media components

4. **Integration Testing**: 
   - Test the new components on all major page types to ensure proper rendering
   - Verify responsive behavior across different device sizes

## Current Considerations

- Finding the right balance between component flexibility and standardization
- Ensuring consistent loading states and error handling across all media components
- Maintaining backward compatibility with existing code during the transition period
- Preparing for future upgrades of the next-cloudinary package 