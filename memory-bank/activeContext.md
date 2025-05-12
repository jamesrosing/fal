# Active Context: Cloudinary Media System Migration

## Current Focus

We're implementing a comprehensive migration to Cloudinary using a Big Bang Migration strategy, with these key components:

1. **Migration Scripts**
   - ✅ Created `migrate-components.js` to update placeholder-based component references to use standard CldImage/CldVideo components
   - ✅ Created `update-database-schema.js` for migrating database to use direct public IDs
   - ✅ Created `migration-status.js` to track migration progress

2. **Direct Cloudinary API**
   - ✅ Implemented new API endpoints in `/app/api/cloudinary` for direct access to Cloudinary assets
   - ✅ Created asset endpoints that work with direct public IDs rather than placeholder IDs
   - ✅ Created responsive image and transformation endpoints for client-side usage
   - ✅ Removed legacy placeholder-based API endpoints that are no longer needed

3. **Standard Cloudinary Components**
   - ✅ Using the established components in `@/components/media` directory (CldImage, CldVideo, etc.)
   - ✅ Created migration guide in `CLOUDINARY-DIRECT-USAGE.md` for developer reference
   - ✅ Established direct public ID usage pattern to avoid indirection

4. **Complete Migration Strategy**
   - ✅ Implemented direct public ID approach, abandoning backward compatibility with placeholders
   - ✅ Created legacy bridge API for transitional support if needed

## Recent Decisions

- **Use Existing Components**: We're using the already-implemented components in `components/media` that wrap the next-cloudinary library with enhanced features.
- **Direct Public ID Approach**: We've decided to completely abandon backward compatibility with placeholder IDs and use Cloudinary public IDs directly in all components and API calls.
- **Script-Based Migration**: Created specialized scripts to handle different aspects of the migration, including component updates and database schema changes.
- **API Structure Simplification**: Restructured the API to use a simpler, more direct approach with Cloudinary public IDs.

## Implementation Flow

1. **Database Schema Update** (`update-database-schema.js`)
   - Migrate the media_assets table to use public_id as the primary identifier
   - Store legacy placeholder IDs in metadata for reference if needed
   - Generate a map of placeholder IDs to public IDs for component migration

2. **Component Migration** (`migrate-components.js`)
   - Replace UnifiedMedia components with CldImage or CldVideo components
   - Update import statements to include imports from '@/components/media'
   - Convert placeholderId props to publicId props with direct Cloudinary public IDs
   - Update API fetch calls to use the new cloudinary endpoints

3. **Migration Status Tracking** (`migration-status.js`)
   - Analyze codebase to identify components that still need migration
   - Generate a report showing migration progress
   - Identify priority files for manual migration

## API Structure

1. **/api/cloudinary/asset/[publicId]**
   - Direct asset retrieval by Cloudinary public ID
   - Handles both images and videos
   - Returns metadata from database if available

2. **/api/cloudinary/responsive/[publicId]**
   - Generates responsive image URLs for different screen sizes
   - Returns srcSet and sizes information for images

3. **/api/cloudinary/transform**
   - Applies transformations to Cloudinary assets
   - Supports all standard Cloudinary transformation options

4. **/api/cloudinary/assets/register**
   - Registers or updates a Cloudinary asset in the database
   - Stores metadata, alt text, dimensions, etc.

5. **/api/cloudinary/assets/list**
   - Lists all Cloudinary assets from the database
   - Supports filtering by type, folder, etc.

6. **/api/cloudinary/legacy-bridge**
   - Transitional endpoint that accepts placeholderId and redirects to the appropriate direct asset

## Next Steps

1. **Run Migration Scripts**:
   - Execute database schema update first
   - Run component migration script
   - Verify migration with status reporter

2. **Manual Review**:
   - Review high-priority files identified by the migration status reporter
   - Manually update any components that couldn't be automatically migrated
   - Test all components to ensure proper rendering

3. **Production Deployment**:
   - Deploy the new API structure
   - Remove legacy placeholder API endpoints
   - Update documentation for developers

## Cloudinary Best Practices

1. **Use Standard Components**: Always use our standard components from `@/components/media`:
   ```jsx
   import { CldImage, CldVideo, MediaAdapter } from '@/components/media';
   ```

2. **Direct PublicId Usage**: Use the Cloudinary publicId directly in components:
   ```jsx
   <CldImage 
     publicId="folder/image-name" 
     width={800} 
     height={600} 
     alt="Description" 
   />
   ```

3. **API URL Encoding**: When calling APIs with public IDs, encode the ID and replace slashes with pipes:
   ```js
   const encodedId = encodeURIComponent("folder/image-name").replace(/\//g, '|');
   fetch(`/api/cloudinary/asset/${encodedId}`);
   ```

4. **Responsive Images**: Use the sizes attribute for responsive behavior:
   ```jsx
   <CldImage
     publicId="folder/image-name"
     width={1200}
     height={800}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     alt="Description"
   />
   ```

5. **Video Configuration**: Use appropriate video settings based on context:
   ```jsx
   <CldVideo
     publicId="folder/video-name"
     width={800}
     height={600}
     autoPlay={true}
     loop={true}
     muted={true}
     controls={false} // For background videos
   />
   ```

6. **Type-Based Media Rendering**: For dynamic content, use MediaAdapter:
   ```jsx
   <MediaAdapter
     mediaType={item.type} // "image" or "video"
     publicId={item.publicId}
     alt={item.alt}
     width={800}
     height={600}
   />
   ```