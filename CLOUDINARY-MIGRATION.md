# Cloudinary Media System Migration Guide

This document outlines the process for migrating from the current placeholder-based media system to a direct Cloudinary implementation using next-cloudinary components.

## Overview

The migration involves:

1. Setting up `next-cloudinary` integration
2. Migrating the database (placeholders to direct public IDs)
3. Updating component imports and usages
4. Cleaning up legacy components and services

## Migration Process

### Step 1: Install Dependencies

```bash
npm install next-cloudinary
```

### Step 2: Database Migration

Run the database migration script to:
- Migrate static registry assets to the media_assets table
- Migrate any existing placeholder records
- Generate a mapping file for placeholder IDs to Cloudinary public IDs

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the migration script
ts-node scripts/migrate-media-to-cloudinary.ts
```

This will create a `cloudinary-replacement-map.json` file with mappings from placeholder IDs to Cloudinary public IDs.

### Step 3: Codebase Migration

Run the code migration script to update component imports and usages:

```bash
# Run in dry-run mode first to see what would be changed
ts-node scripts/cloudinary-code-migration.ts --dry-run

# Run the actual migration
ts-node scripts/cloudinary-code-migration.ts
```

This script will:
- Update import statements to use CldImage/CldVideo instead of legacy components
- Convert placeholderId props to publicId props
- Convert component tags
- Add TODO comments for dynamic placeholderId props that need manual review
- Create backup files for all modified files

### Step 4: Manual Review and Fixes

After the automated migration, review:
1. Files with TODO comments for dynamic placeholderId props
2. Any components that might not have been fully migrated
3. Test the application to ensure all media is rendering correctly

### Step 5: Cleanup

Once everything is working correctly, run the cleanup script to remove legacy components:

```bash
# Run in dry-run mode first
ts-node scripts/cleanup-legacy-media.ts --dry-run

# Run the actual cleanup
ts-node scripts/cleanup-legacy-media.ts
```

This will:
- Check for any remaining references to legacy components
- Create backups of all files before deletion
- Remove legacy components and services
- Provide instructions for cleaning up database tables

## Components Overview

### CldImage Component

`CldImage` is a wrapper around `next-cloudinary`'s `CldImage` component with additional features:
- Loading state handling
- Error handling with fallbacks
- Responsive image support
- Format and quality auto-optimization

```tsx
<CldImage
  publicId="folder/image-name"
  alt="Description of the image"
  width={1200}
  height={600}
  priority
/>
```

### CldVideo Component

`CldVideo` is a wrapper around `next-cloudinary`'s `CldVideoPlayer` component with additional features:
- Loading state handling
- Error handling with fallbacks
- Responsive video support
- Format and quality auto-optimization

```tsx
<CldVideo
  publicId="folder/video-name"
  width={800}
  height={450}
  controls
  autoplay={false}
/>
```

## Troubleshooting

### Common Issues

1. **Missing publicId**: If you see missing images, check that the publicId is correct and the asset exists in Cloudinary.

2. **Dynamic placeholderId conversion**: Look for TODO comments in the codebase that flag dynamic placeholderId props that need manual conversion.

3. **Import errors**: If you see import errors for legacy components, make sure all imports have been updated to use the new components.

4. **Type errors**: If you encounter type errors, make sure you're using the correct props for the new components.

### Reverting Changes

If necessary, you can revert to the previous implementation:

1. Restore files from the backup directory created during migration
2. Revert changes to next.config.ts
3. Keep the migrated database tables for future migration attempts

## Future Improvements

1. Add more advanced Cloudinary features like lazy loading, blur-up placeholders, etc.
2. Implement image optimization presets for different use cases
3. Add analytics for media usage
4. Consider a Cloudinary Media Library integration for content management