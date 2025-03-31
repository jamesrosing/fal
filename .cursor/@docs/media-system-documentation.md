# FAL Media System Documentation

This document provides comprehensive information about the media system implementation in the FAL project. The system is designed to provide a consistent, maintainable approach to handling images and videos throughout the application.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Components](#components)
- [Usage Patterns](#usage-patterns)
- [Asset Types](#asset-types)
- [Best Practices](#best-practices)
- [Migration](#migration)
- [Tools and Scripts](#tools-and-scripts)

## Directory Structure

### Physical Directory Structure

The media system uses a clear, organized directory structure:

```
public/
  ├── images/
  │   ├── global/         # Shared across multiple pages
  │   │   ├── logos/      # Brand logos
  │   │   ├── icons/      # Icon assets
  │   │   └── ui/         # UI elements
  │   └── pages/          # Page-specific folders
  │       ├── home/
  │       ├── about/
  │       ├── services/   # Service-related image assets
  │       │   ├── plastic-surgery/
  │       │   ├── dermatology/
  │       │   ├── medical-spa/
  │       │   └── functional-medicine/
  │       └── team/       # Team member assets
  └── videos/
      ├── backgrounds/    # Video backgrounds
      └── content/        # Content videos

components/
  ├── Hero/
  │   ├── Hero.js
  │   └── assets/         # Component-specific assets
  ├── ServiceCard/
  │   ├── ServiceCard.js
  │   └── assets/         # Component-specific assets
  └── TeamMember/
      ├── TeamMember.js
      └── assets/         # Component-specific assets
```

### Cloudinary Structure

For remote assets stored in Cloudinary, we maintain a parallel structure:

```
fal/                      # Root folder
  ├── hero/               # Hero section images
  ├── articles/           # Article header and content images
  ├── services/           # Service category images
  │   ├── plastic-surgery/
  │   ├── dermatology/
  │   ├── medical-spa/
  │   └── functional-medicine/
  ├── team/
  │   └── headshots/      # Team member headshots
  ├── gallery/            # Gallery images
  ├── branding/           # Logo and brand assets
  └── videos/
      ├── backgrounds/    # Background videos
      └── thumbnails/     # Video thumbnails
```

## Components

### Core Media Components

1. **OptimizedImage**: A wrapper around Next.js Image component that supports:
   - Component-specific assets: `component:Hero/assets/background.jpg`
   - Page-specific assets: `page:home/hero.jpg` 
   - Cloudinary assets: `services/example-service`
   - Full optimization with proper sizing and formats

2. **OptimizedVideo**: A video component with:
   - Responsive sources for different screen sizes
   - Fallback image for loading states
   - Performance optimizations
   - Support for component and page-specific videos

3. **MediaRenderer**: A unified component that:
   - Automatically detects media type (image/video)
   - Renders the appropriate optimized component
   - Provides consistent props interface

### Layout Components

1. **TwoColumnLayout**: A reusable layout with a media column and content column.
2. **MediaContentSection**: A higher-level component for common section patterns.

## Usage Patterns

### 1. Component-Specific Media

Assets that belong specifically to a component should be co-located with that component:

```jsx
// components/Hero/Hero.js
import { OptimizedImage } from '@/components/media/OptimizedImage';

export function Hero() {
  return (
    <div className="relative h-screen">
      <OptimizedImage
        id="component:Hero/assets/hero-background.jpg" 
        alt="Hero background"
        fill
      />
      {/* Content */}
    </div>
  );
}
```

### 2. Page-Specific Media

Media specific to a page should be imported directly within that page:

```jsx
// app/services/page.js
import { OptimizedImage } from '@/components/media/OptimizedImage';

export default function ServicesPage() {
  return (
    <div>
      <OptimizedImage
        id="page:services/hero.jpg"
        alt="Services" 
        fill
      />
      {/* Page content */}
    </div>
  );
}
```

### 3. Registry-Based Media

For managed assets (especially from Cloudinary), use the media registry:

```jsx
// Using a registered asset ID
<OptimizedImage
  id="hero-main"  // Registered in lib/image-config.js
  alt="Main hero" 
  fill
/>
```

### 4. Layout-Based Media Placement

Use layout components to standardize how media is displayed:

```jsx
// app/about/page.js
import { MediaContentSection } from '@/components/layouts/TwoColumnLayout';

export default function AboutPage() {
  return (
    <MediaContentSection
      media={{
        id: 'page:about/team-photo.jpg',
        alt: 'Our team',
        type: 'image'
      }}
      title="About Our Team"
      description="Learn more about our dedicated professionals."
    >
      <button>Meet the Team</button>
    </MediaContentSection>
  );
}
```

## Asset Types

### 1. Local Static Assets

Assets stored in the public directory:
- Referenced with `page:` prefix
- Path is relative to the public/images/pages directory
- Example: `page:home/hero.jpg` maps to `/public/images/pages/home/hero.jpg`

### 2. Component Assets

Assets co-located with components:
- Referenced with `component:` prefix
- Path is relative to the component directory
- Example: `component:Hero/assets/background.jpg`

### 3. Cloudinary Assets

Remote assets stored in Cloudinary:
- Referenced by their path within Cloudinary
- Automatically optimized with transformations
- Can be registered in the media registry for type safety

## Best Practices

1. **Always Provide Alt Text**
   - All images must have descriptive alt text for accessibility
   - Use the `alt` prop on all media components

2. **Use Priority for Above-the-Fold Images**
   - Add `priority` prop to critical images visible on initial load

3. **Implement Proper Loading States**
   - Use blur placeholders for images
   - Use thumbnail fallbacks for videos

4. **Choose the Right Asset Type**
   - Component-specific assets: Use for components that always use the same media
   - Page-specific assets: Use for page-level media
   - Cloudinary assets: Use for dynamic content and optimized delivery

5. **Validate Paths**
   - Use the structure validation to ensure assets are in the correct directory

## Migration

To migrate existing media to the new system:

1. Run the automated migration script:
   ```bash
   npm run media:migrate
   ```

2. Verify assets are properly accessible:
   ```bash
   npm run media:verify
   ```

3. Manually review key sections for any issues.

## Tools and Scripts

1. **Media Migration Script**
   - Automatically converts existing image and video tags to use the new components
   - Path: `scripts/migrate-media.js`
   - Usage: `npm run media:migrate`

2. **Media Verification Script**
   - Checks if all registered media assets are accessible
   - Path: `scripts/verify-media.js`
   - Usage: `npm run media:verify`

3. **Directory Structure Validator**
   - Ensures assets are placed in the correct directories
   - Path: `lib/media/structure.js`

4. **Media Registration Tool**
   - Automatically scans the directory structure and registers media assets
   - Detects component-specific, page-specific, and global assets
   - Generates Cloudinary asset examples based on the directory structure
   - Outputs a comprehensive asset registry to `lib/image-config.js`
   - Creates a report with asset statistics in `media-assets-report.json`
   - Path: `scripts/register-media-assets.js`
   - Usage: `npm run media:register`

### Using the Media Registration Tool

The media registration tool helps maintain your media asset registry by:

1. **Scanning directories**: It scans all asset directories according to our structure to find media files
2. **Generating metadata**: It creates asset entries with appropriate IDs, types, and default options
3. **Creating a registry**: It outputs a properly formatted registry to `lib/image-config.js`

To use the tool:

```bash
# Run the registration tool
npm run media:register

# Check the generated registry
cat lib/image-config.js

# View the asset report
cat media-assets-report.json
```

When adding new media assets to your project:

1. Place them in the appropriate directory according to their purpose:
   - Component-specific: `components/ComponentName/assets/`
   - Page-specific: `public/images/pages/pageName/`
   - Global: `public/images/global/category/`

2. Run the registration tool to update the registry:
   ```bash
   npm run media:register
   ```

3. Use the registered assets in your components:
   ```jsx
   // Using a registered component asset
   <OptimizedImage id="hero-hero-background" alt="Hero background" />
   
   // Using a registered page asset
   <OptimizedImage id="hero" alt="Example hero" />
   ```

The tool maintains consistency by ensuring that all assets follow the same structure and naming conventions. 