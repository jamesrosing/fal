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

3. **Migration Strategy**
   - ✅ Designed mapping strategy between placeholder IDs and Cloudinary public IDs
   - ✅ Created plan to update component references and props (placeholderId → publicId)
   - ✅ Established process for removing legacy media components after verification

## Recent Decisions

- **Big Bang Migration Approach**: We've decided to use a comprehensive migration strategy that handles database migration, code updates, and cleanup in coordinated steps.
- **Leveraging Existing Components**: We're using the existing well-implemented Cloudinary components (CldImage, CldVideo, CldUploadWidget) rather than creating duplicates.
- **Script-Based Migration**: Created multiple specialized scripts to handle different aspects of the migration.

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