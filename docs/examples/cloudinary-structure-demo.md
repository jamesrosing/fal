# Cloudinary Structure Alignment Demo

This document demonstrates how to implement the 1:1 alignment between local folders and Cloudinary structure.

## Prerequisites

- Node.js environment with necessary dependencies
- Access to the Cloudinary account
- Local media files in the appropriate structure

## Step 1: Run the Alignment Script

The alignment script maps local directory structure to Cloudinary and uploads missing assets:

```bash
npm run media:align
```

### Expected Output

```
🚀 Starting Cloudinary structure alignment...

📁 Creating Cloudinary folders to match local structure...
Creating Cloudinary folder: fal/pages
Creating Cloudinary folder: fal/global
Creating Cloudinary folder: fal/components
Creating Cloudinary folder: fal/videos
Creating Cloudinary folder: fal/pages/services/plastic-surgery
Creating Cloudinary folder: fal/pages/services/plastic-surgery/body
Creating Cloudinary folder: fal/pages/services/plastic-surgery/breast
Creating Cloudinary folder: fal/pages/services/plastic-surgery/head-and-neck
...

🔍 Finding all local media files...
Found 52 local media files

🔄 Checking which files already exist in Cloudinary...
Checked 52 files
22 files need to be uploaded to Cloudinary

📤 Uploading missing files to Cloudinary...
Uploading D:\fal\public\images\pages\services\plastic-surgery\body\plastic-surgery-body-hero.jpg to fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero...
✅ Successfully uploaded to https://res.cloudinary.com/dyrzyfg3w/image/upload/v1743652166/fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero.jpg
...

Upload Summary: 22 successful, 0 failed

📝 Generating media registry...
Generated registry with 52 entries in lib/image-config.js

📚 Generating component reference guide...
Generated reference guide at docs/media-reference-guide.md

✨ Cloudinary structure alignment complete!
Now your local directory structure and Cloudinary structure are in 1:1 alignment.
```

## Step 2: Update Component References

Next, run the script to update all component references to use the standardized path format:

```bash
npm run media:update-paths
```

### Expected Output

```
🔍 Finding files with component references...
Found 34 files to check
✅ Updated 3 references in app/services/plastic-surgery/body/page.tsx
✅ Updated 5 references in app/services/plastic-surgery/breast/page.tsx
✅ Updated 4 references in app/services/plastic-surgery/head-and-neck/page.tsx
✅ Updated 2 references in app/services/plastic-surgery/page.tsx
...

✨ Component path update complete!
Updated 42 component references across 34 files.
```

## Step 3: Verify the Integration

After running both scripts, you should:

1. Check that images load correctly in the browser
2. Review the generated reference guide
3. Verify the media registry

### Before and After Examples

#### Before:

```jsx
// Inconsistent path reference
<CloudinaryImage 
  id="plastic-surgery/body-hero.jpg" 
  alt="Body Procedures" 
  priority 
  fill 
/>
```

#### After:

```jsx
// Standardized full path reference
<CloudinaryImage 
  id="fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero" 
  alt="Body Procedures" 
  priority 
  fill 
  width={1920}
  height={1080}
  className="object-cover"
/>
```

## Step 4: Adopt the New Standards

When adding new images:

1. Place the file in the appropriate local folder:
   ```
   public/images/pages/services/plastic-surgery/body/new-procedure.jpg
   ```

2. Run the alignment script to upload to Cloudinary:
   ```bash
   npm run media:align
   ```

3. Reference in components using the full path:
   ```jsx
   <CloudinaryImage
     id="fal/pages/services/plastic-surgery/body/new-procedure"
     alt="New Procedure"
     // other props...
   />
   ```

## Conclusion

This standardized approach ensures that:

1. Every local image has a corresponding Cloudinary asset at the same path
2. All component references use the same standardized format
3. The media registry and reference guide make it easy to find and use assets

For a full implementation plan, see [the Cloudinary Migration Plan](../cloudinary-migration-plan.md) 