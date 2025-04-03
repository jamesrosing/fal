# Media System Implementation - 1:1 Folder Structure

## Overview

This document outlines the implementation of the media system with a 1:1 folder structure between local directories and Cloudinary. This approach ensures consistent media references throughout the application and simplifies media management.

## Folder Structure

### Local Directory Structure

We've created a comprehensive directory structure in the `public` folder:

```
public/
  ├── images/
  │   ├── global/            # Shared across multiple pages
  │   │   ├── logos/         # Brand logos
  │   │   ├── icons/         # Icon assets
  │   │   └── ui/            # UI elements
  │   └── pages/             # Page-specific folders
  │       ├── home/
  │       ├── about/
  │       ├── services/      # Service-related image assets
  │       │   ├── plastic-surgery/
  │       │   │   ├── body/
  │       │   │   │   ├── abdominoplasty/
  │       │   │   │   ├── mini-abdominoplasty/
  │       │   │   │   ├── liposuction/
  │       │   │   │   ├── arm-lift/
  │       │   │   │   └── thigh-lift/
  │       │   │   ├── breast/
  │       │   │   │   ├── breast-augmentation/
  │       │   │   │   ├── breast-reduction/
  │       │   │   │   ├── breast-revision/
  │       │   │   │   └── breast-nipple-areolar-complex/
  │       │   │   └── head-and-neck/
  │       │   │       ├── face/
  │       │   │       ├── eyelids/
  │       │   │       ├── ears/
  │       │   │       ├── nose/
  │       │   │       └── neck/
  │       │   ├── dermatology/
  │       │   ├── medical-spa/
  │       │   └── functional-medicine/
  │       └── team/          # Team member assets
  └── videos/
      ├── backgrounds/       # Video backgrounds
      └── content/           # Content videos
```

### Cloudinary Structure

The Cloudinary structure mirrors the local directory structure exactly:

```
fal/                       # Root folder
  ├── pages/               # Page-specific images
  │   ├── home/
  │   ├── about/
  │   ├── services/
  │   │   ├── plastic-surgery/
  │   │   │   ├── body/
  │   │   │   │   ├── abdominoplasty/
  │   │   │   │   ├── mini-abdominoplasty/
  │   │   │   │   ├── liposuction/
  │   │   │   │   ├── arm-lift/
  │   │   │   │   └── thigh-lift/
  │   │   │   ├── breast/
  │   │   │   │   ├── breast-augmentation/
  │   │   │   │   ├── breast-reduction/
  │   │   │   │   ├── breast-revision/
  │   │   │   │   └── breast-nipple-areolar-complex/
  │   │   │   └── head-and-neck/
  │   │   │       ├── face/
  │   │   │       ├── eyelids/
  │   │   │       ├── ears/
  │   │   │       ├── nose/
  │   │   │       └── neck/
  │   │   ├── dermatology/
  │   │   ├── medical-spa/
  │   │   └── functional-medicine/
  │   └── team/
  ├── global/              # Global images
  │   ├── logos/
  │   ├── icons/
  │   └── ui/
  ├── components/          # Component assets
  └── videos/
      ├── backgrounds/
      └── content/
```

## Tools and Scripts

We've created several scripts to manage this 1:1 structure:

1. **`create-media-structure.bat`**
   - Creates the local directory structure
   - Usage: `npm run media:structure`

2. **`cloudinary-migrate.js`**
   - Uploads files from local folders to Cloudinary
   - Usage: `npm run media:migrate`

3. **`align-cloudinary-structure.js`**
   - Ensures perfect 1:1 alignment between local and Cloudinary folders
   - Creates missing folders in Cloudinary
   - Generates a media registry and reference guide
   - Usage: `npm run media:align`

4. **`update-component-paths.js`**
   - Updates component references to use standardized Cloudinary paths
   - Usage: `npm run media:update-paths`

5. **Full Sync**
   - Runs both alignment and path update scripts
   - Usage: `npm run media:full-sync`

## Implementation Process

We followed these steps to implement the system:

1. Created the local directory structure using the `create-media-structure.bat` script
2. Uploaded existing media to Cloudinary with the `cloudinary-migrate.js` script
3. Ran `align-cloudinary-structure.js` to ensure all folders existed in Cloudinary
4. Updated component references to use standardized paths with `update-component-paths.js`
5. Updated the CloudinaryMedia component to properly handle the full paths

## Using the System

### Adding New Media

1. Place the new image in the appropriate local folder:
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

### Path Format

All component references should use the full path:

```jsx
import { CloudinaryImage } from '@/components/media/CloudinaryMedia';

<CloudinaryImage
  id="fal/pages/services/plastic-surgery/body/tummy-tuck"
  alt="Tummy Tuck Procedure"
  fill
  width={800}
  height={600}
  className="object-cover"
  sizes="100vw"
/>
```

## Benefits

This 1:1 mapping approach provides several benefits:

1. **Consistency**: All media references follow the same pattern
2. **Maintainability**: Clear connection between local and Cloudinary files
3. **Developer Experience**: Easier to find and reference media assets
4. **Future-Proofing**: New services and procedures can be easily added

## Reference Documentation

For more information, see:

- [Cloudinary Migration Plan](cloudinary-migration-plan.md)
- [Cloudinary Structure Demo](examples/cloudinary-structure-demo.md)
- [Media System Documentation](../.cursor/@docs/media-system-documentation.md) 