# Cloudinary Migration Guide

This guide provides detailed instructions for migrating from Vercel Blob to Cloudinary in your application.

## Overview

The migration process consists of two main steps:

1. **Generate Organization Structure**: Analyze your application structure and create a logical folder organization in Cloudinary.
2. **Upload and Replace**: Upload placeholder images to Cloudinary and replace all Vercel Blob URLs in your codebase.

## Prerequisites

Before starting the migration, ensure you have:

1. A Cloudinary account with API credentials
2. Node.js installed (v14 or higher)
3. Required npm packages:
   - cloudinary
   - axios
   - glob
   - chalk
   - dotenv

## Installation

```bash
npm install cloudinary axios glob chalk dotenv
```

## Environment Setup

Create a `.env.local` file in your project root with your Cloudinary credentials:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Migration Process

### Step 1: Generate Cloudinary Organization Structure

Run the first script to analyze your application and generate a Cloudinary folder structure:

```bash
node scripts/generate-cloudinary-organization.js
```

This script will:

1. Fetch your site's media map from `/api/site/media-map` to understand the application structure
2. Find all Vercel Blob URLs in your codebase
3. Generate a logical folder structure in Cloudinary that mirrors your application
4. Check for existing folders in your Cloudinary account before creating new ones
5. Generate a migration map (`cloudinary-migration-map.json`) for the next step
6. Create documentation of the organization structure (`docs/cloudinary-organization.md`)

### Step 2: Upload Images and Replace URLs

Run the second script to upload images to Cloudinary and replace Vercel Blob URLs in your code:

```bash
node scripts/upload-and-replace.js
```

This script will:

1. Use the migration map generated in Step 1
2. Check for existing assets in Cloudinary before uploading
3. Look for placeholder images in your `public/images/place` directory
4. Upload new images to Cloudinary with proper organization
5. Replace all Vercel Blob URLs in your codebase with Cloudinary URLs
6. Convert `<Image>` components to `<CloudinaryImage>` components where appropriate
7. Generate a replacement map (`cloudinary-replacement-map.json`) for reference

> **Note**: The scripts now automatically load credentials from the `.env.local` file. If for some reason the credentials aren't being loaded, you can still run the scripts with the dotenv preload flag:
> ```bash
> node -r dotenv/config scripts/generate-cloudinary-organization.js
> node -r dotenv/config scripts/upload-and-replace.js
> ```

### Step 3: Verify the Migration

Verify that all Vercel Blob URLs have been replaced:

```bash
node scripts/find-vercel-blob-urls.js
```

## ES Module Format

The scripts use ES Module format (import/export) instead of CommonJS (require). This is important if you have a `package.json` in your scripts directory with `"type": "module"`.

If you encounter issues with the module format, make sure your Node.js version supports ES Modules (v12 or higher is recommended).

## Handling Existing Cloudinary Content

The migration scripts are designed to work with existing Cloudinary content by:

1. **Detecting existing folders**: Before creating folders, the script checks if they already exist
2. **Preserving existing assets**: The upload process checks if assets already exist in Cloudinary
3. **Using existing assets**: If an asset exists, its information is retrieved and used instead of uploading a new one
4. **No deletion of content**: The scripts never delete existing content from your Cloudinary account

This ensures that:
- Your existing Cloudinary organization is respected
- No duplicate assets are created
- No content is lost during migration

## Fallback Mechanisms

The scripts include several fallback mechanisms to handle edge cases:

1. If the `/api/site/media-map` endpoint is unavailable, a default folder structure is used
2. If placeholder images are missing, the script can:
   - Use images from other directories
   - Use Cloudinary's built-in placeholders
   - Create dummy transparent images

## Cloudinary Best Practices

The migration implements these Cloudinary best practices:

1. **Logical Folder Structure**:
   - Mirrors your application's page and section structure
   - Organizes assets by content type and purpose
   - Integrates with existing folder structure

2. **Consistent Naming Conventions**:
   - `[section]-[description]-[variant]` pattern
   - Descriptive public IDs that reflect content

3. **Strategic Tagging**:
   - Content type tags (`image`, `video`)
   - Section and page tags
   - Functional tags (`hero`, `gallery`, etc.)

4. **Metadata and Context**:
   - Alt text for accessibility
   - Page and section context

5. **Optimized Transformations**:
   - Uses `f_auto` and `q_auto` for automatic format and quality
   - Responsive sizing for different devices

## Component Integration

The migration will convert image references to use the `CloudinaryImage` component:

```jsx
// Before migration
<Image
  src="https://vercel-blob-url.com/image.webp"
  alt="Description"
  width={800}
  height={600}
/>

// After migration
<CloudinaryImage
  publicId="services/dermatology/dermatology-acne"
  alt="Description"
  options={{ width: 800, height: 600, crop: 'fill' }}
/>
```

## Troubleshooting

### Module Format Issues

If you encounter errors like `require is not defined in ES module scope`, ensure you're using the correct module format:

1. Check if you have a `package.json` in your scripts directory with `"type": "module"`
2. Use `import` instead of `require` in your scripts
3. Run with the `-r dotenv/config` flag as shown in the examples

### Missing Dependencies

If you encounter errors about missing dependencies, install them:

```bash
npm install cloudinary axios glob chalk dotenv
```

### Cloudinary Authentication Issues

If you encounter authentication issues:

1. Verify your Cloudinary credentials in `.env.local`
2. Ensure your account has upload permissions
3. Check API rate limits

### Image Matching Issues

If the script has trouble matching placeholder images:

1. Ensure your placeholder images follow a similar naming convention as the Vercel Blob URLs
2. Adjust the similarity threshold in the script if needed (default is 0.3)

## Manual Post-Migration Tasks

After running the scripts, you may need to:

1. Fine-tune some image replacements for optimal quality
2. Update any dynamic URL generation logic in your code
3. Implement Cloudinary collections for content management
4. Set up automated backups of your Cloudinary assets
5. Configure access controls for sensitive content

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next Cloudinary Documentation](https://next-cloudinary.spacejelly.dev/) 