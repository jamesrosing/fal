# Active Context: Cloudinary Media System Migration

## Current Focus

We're implementing a comprehensive migration to Cloudinary using a Big Bang Migration strategy, with these key components:

1. **Migration Scripts**
   - ✅ Created `migrate-media-to-cloudinary.js` for database migration to map placeholders to Cloudinary public IDs
   - ✅ Created `cloudinary-code-migration.ts` for updating component references to use Cloudinary components
   - ✅ Created `cleanup-legacy-media.ts` for removing legacy components after successful migration
   - ⏳ In progress: Fixing TypeScript type issues in migration scripts
   - ⏳ In progress: Creating PowerShell-compatible versions of search commands

2. **Cloudinary Components**
   - ✅ Using existing well-implemented Cloudinary components: CldImage, CldVideo, CldUploadWidget
   - ✅ Implemented secure uploads via `app/api/cloudinary/signed-upload/route.ts`
   - ✅ Configured environment variables in `next.config.ts`
   - ✅ Successfully implemented responsive Cloudinary video background on the homepage hero section
   - ✅ Replaced original Hero component with enhanced HeroSection using CldVideoPlayer

3. **Migration Strategy**
   - ✅ Designed mapping strategy between placeholder IDs and Cloudinary public IDs
   - ✅ Created plan to update component references and props (placeholderId → publicId)
   - ✅ Established process for removing legacy media components after verification

## Recent Decisions

- **Big Bang Migration Approach**: We've decided to use a comprehensive migration strategy that handles database migration, code updates, and cleanup in coordinated steps.
- **Leveraging Existing Components**: We're using the existing well-implemented Cloudinary components (CldImage, CldVideo, CldUploadWidget) rather than creating duplicates.
- **Script-Based Migration**: Created multiple specialized scripts to handle different aspects of the migration.
- **Cloudinary Video Implementation**: Successfully implemented responsive video background using Cloudinary's CldVideoPlayer component with direct publicId references rather than API-based resolution.
- **Mobile/Desktop Conditional Rendering**: Instead of using CSS media queries, we're using React's conditional rendering with device detection for better video performance and resource management.

## Key Challenges

1. **Module System Mismatch**: 
   - ES modules vs CommonJS compatibility issues in migration scripts
   - Need to adapt import/require statements for proper execution

2. **TypeScript Type Safety**: 
   - Static type checking issues in migration scripts
   - Need to add proper type annotations to migration functions

3. **Windows Compatibility**:
   - Need to adapt grep-based search commands for Windows PowerShell
   - Creating fallback search methods for file discovery

4. **Cloudinary Video Issues**:
   - ✅ Fixed issues with Cloudinary video transformation parameters causing playback failures
   - ✅ Resolved mobile/desktop video responsive rendering with proper conditional component rendering
   - ✅ Fixed CSS styling issues to ensure videos properly fill the screen on all devices
   - ✅ Improved mobile UX with enhanced hamburger menu icon and navigation

## Implementation Flow

1. **Database Migration** (`migrate-media-to-cloudinary.js`)
   - Migrate static registry assets to the media_assets table
   - Check for and migrate legacy media_assets_old table if it exists
   - Generate publicId mapping file for migration script

2. **Code Migration** (`cloudinary-code-migration.ts`)
   - Find files with placeholder components and placeholderId props
   - Replace imports of placeholder components with CldImage/CldVideo
   - Convert placeholderId props to publicId
   - Update component tags in JSX

3. **Legacy Cleanup** (`cleanup-legacy-media.ts`)
   - Check for remaining references to legacy components
   - Create backups of files before deleting
   - Remove legacy components, services, and configurations

## Next Steps

1. **Fix Migration Scripts**:
   - Address TypeScript linting issues in cloudinary-code-migration.ts
   - Create type-safe interfaces for migration functions
   - Adapt grep commands for Windows PowerShell compatibility

2. **Run Migration Scripts**:
   - Execute database migration first (migrate-media-to-cloudinary.js)
   - Run code migration next (cloudinary-code-migration.ts)
   - Perform legacy cleanup last (cleanup-legacy-media.ts)

3. **Verify and Test**:
   - Review dynamically generated TODO comments in migrated files
   - Convert remaining dynamic placeholderId props to publicId
   - Test all components to ensure proper rendering and responsiveness

## Current Considerations

- Finding the right balance between automated migration and manual review
- Ensuring backward compatibility during the transition period
- Handling dynamic placeholderId props that require context-specific conversion
- Adapting file search logic for Windows environment 

## Cloudinary Video Best Practices

Based on our successful hero section implementation, we've identified these best practices for Cloudinary video:

1. **Direct PublicId Usage**: Use the Cloudinary publicId directly in the CldVideoPlayer component's `src` prop rather than API-based resolution for reliability and performance.

2. **Device-Specific Videos**: Use React's conditional rendering to serve different video resolutions based on device type:
   ```jsx
   {isMobile ? (
     <CldVideoPlayer 
       id="mobile-video" 
       src="emsculpt/videos/hero/hero-480p-mp4"
       // ... props
     />
   ) : (
     <CldVideoPlayer 
       id="desktop-video" 
       src="emsculpt/videos/hero/hero-720p-mp4"
       // ... props
     />
   )}
   ```

3. **Minimal Transformations**: Avoid complex transformations directly in the CldVideoPlayer component. If transformations are needed, use them sparingly and follow Cloudinary's recommendations.

4. **CSS Styling**: Use styled-jsx to ensure videos properly fill their containers:
   ```jsx
   <style jsx global>{`
     .cld-video-player {
       position: absolute !important;
       width: 100% !important;
       height: 100% !important;
       object-fit: cover !important;
     }
   `}</style>
   ```

5. **Fallback Handling**: Include error handling and placeholders for when videos fail to load or during initial loading state.

6. **Player Configuration**: Set essential player options for background videos:
   ```jsx
   <CldVideoPlayer
     src="video-public-id"
     width="100%"
     height="100%"
     autoplay={true}
     loop={true}
     muted={true}
     controls={false}
     // Additional settings
   />
   ```

7. **Unique Player IDs**: Always provide unique ID attributes to each CldVideoPlayer to avoid conflicts:
   ```jsx
   <CldVideoPlayer id="hero-video-desktop" ... />
   <CldVideoPlayer id="hero-video-mobile" ... />
   ```
   
8. **Container Styling**: Ensure proper container styling to maintain aspect ratio and positioning:
   ```jsx
   <section className="relative w-full h-screen overflow-hidden">
     <div className="absolute inset-0 w-full h-full">
       <CldVideoPlayer ... />
     </div>
   </section>
   ``` 