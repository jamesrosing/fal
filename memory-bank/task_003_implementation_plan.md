# Task 3: Cloudinary Media System Implementation Plan

## Overview
This document outlines the detailed approach for implementing the Cloudinary Media System as specified in the PRD, focusing on migrating from the current placeholder-based system to direct use of Cloudinary public IDs and implementing next-cloudinary components.

## Current Implementation Analysis

**Current Media Components:**
- `UnifiedImage.tsx`: Wrapper that resolves placeholder IDs to Cloudinary URLs
- `OptimizedImage.tsx`: Component for optimized image rendering
- `OptimizedVideo.tsx`: Component for optimized video rendering
- `ServerImage.tsx`: Server component version of image handling
- `MediaRenderer.tsx`: Generic media rendering component
- `CloudinaryMedia.tsx`: Direct Cloudinary implementation

**Current Media Services:**
- `media-service.ts`: Service that resolves placeholder IDs and generates URLs
- `registry.ts`: Registry for media assets with a static asset mapping
- `image-config.js`: Static definition of known media assets

## Required Changes

### 1. Component Implementation

1. **Create CldImage Component**
```typescript
// components/media/CldImage.tsx
import { CldImage } from 'next-cloudinary';

interface CldEnhancedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export default function CldEnhancedImage({
  publicId,
  alt,
  width = 800,
  height = 600,
  priority = false,
  sizes = '100vw',
  className = '',
  ...props
}: CldEnhancedImageProps) {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt}
      priority={priority}
      sizes={sizes}
      className={className}
      format="auto"
      quality="auto"
      {...props}
    />
  );
}
```

2. **Create CldVideo Component**
```typescript
// components/media/CldVideo.tsx
import { CldVideoPlayer } from 'next-cloudinary';

interface CldVideoProps {
  publicId: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  posterPublicId?: string;
}

export default function CldVideo({
  publicId,
  width = 800,
  height = 450,
  autoPlay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
  posterPublicId,
  ...props
}: CldVideoProps) {
  return (
    <CldVideoPlayer
      src={publicId}
      width={width}
      height={height}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      className={className}
      poster={posterPublicId}
      {...props}
    />
  );
}
```

3. **Create CldOgImage Utility**
```typescript
// lib/cloudinary/og-image.ts
import { formatCldUrlWithTransformations } from 'next-cloudinary/helpers';

interface OgImageOptions {
  publicId: string;
  text?: {
    text: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    position?: 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  };
  overlays?: Array<{
    publicId: string;
    position?: { gravity: string };
    effects?: Array<{ opacity?: number; blur?: number }>;
  }>;
}

export function generateOgImageUrl(options: OgImageOptions): string {
  const { publicId, text, overlays } = options;
  
  const transformations = [];
  
  if (text) {
    transformations.push({
      overlay: {
        font_family: text.fontFamily || 'Arial',
        font_size: text.fontSize || 60,
        font_weight: text.fontWeight || 'bold',
        text: text.text
      },
      color: text.color || 'white',
      gravity: text.position || 'center'
    });
  }
  
  if (overlays) {
    overlays.forEach(overlay => {
      transformations.push({
        overlay: {
          public_id: overlay.publicId
        },
        gravity: overlay.position?.gravity || 'center',
        opacity: overlay.effects?.find(e => e.opacity !== undefined)?.opacity || 100,
        blur: overlay.effects?.find(e => e.blur !== undefined)?.blur || 0
      });
    });
  }
  
  return formatCldUrlWithTransformations({
    publicId,
    transformations,
    format: 'auto',
    quality: 'auto'
  });
}
```

### 2. Next.js Configuration

```typescript
// next.config.ts
import { withNextCloudinary } from 'next-cloudinary/plugin';

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['next-cloudinary'],
  // ... other config options
};

export default withNextCloudinary(nextConfig);
```

### 3. Media Service Implementation

```typescript
// lib/services/media-service.ts
import { cache } from 'react';
import { createClient } from '@/lib/supabase';
import { MediaAsset } from '@/types';

export interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
  gravity?: string;
}

export class MediaService {
  // Fetch media by public ID
  getMediaByPublicId = cache(async (publicId: string): Promise<MediaAsset | null> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('public_id', publicId)
      .single();
      
    if (error || !data) {
      console.error(`Error fetching media asset with public ID ${publicId}:`, error);
      return null;
    }
    
    return data as MediaAsset;
  });
  
  // Get multiple media assets by public IDs
  async getMediaByPublicIds(publicIds: string[]): Promise<Record<string, MediaAsset | null>> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .in('public_id', publicIds);
    
    if (error) {
      console.error('Error fetching multiple media assets:', error);
      return {};
    }
    
    const result: Record<string, MediaAsset | null> = {};
    publicIds.forEach(id => {
      result[id] = data?.find(asset => asset.public_id === id) || null;
    });
    
    return result;
  }
  
  // Add or update a media asset
  async upsertMediaAsset(asset: Partial<MediaAsset> & { public_id: string }): Promise<MediaAsset | null> {
    const supabase = createClient();
    
    // Check if the asset already exists
    const { data: existingAsset } = await supabase
      .from('media_assets')
      .select('id')
      .eq('public_id', asset.public_id)
      .single();
    
    if (existingAsset) {
      // Update existing asset
      const { data, error } = await supabase
        .from('media_assets')
        .update({
          ...asset,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating media asset ${asset.public_id}:`, error);
        return null;
      }
      
      return data as MediaAsset;
    } else {
      // Create new asset
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          ...asset,
          type: asset.type || 'image'
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating media asset ${asset.public_id}:`, error);
        return null;
      }
      
      return data as MediaAsset;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;
```

### 4. Type Definitions

```typescript
// types/media.ts
export interface MediaAsset {
  id: string;
  public_id: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  format?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### 5. Migration Strategy

#### Phase 1: Setup Dependencies
1. Install next-cloudinary package
```bash
npm install next-cloudinary
```

2. Configure Next.js with withNextCloudinary plugin

#### Phase 2: Create New Components
1. Implement CldImage component
2. Implement CldVideo component
3. Implement OG image utility functions

#### Phase 3: Create Migration Scripts
1. Create script to migrate existing data to new format
```typescript
// scripts/migrate-media-to-cloudinary.ts
import { createClient } from '@/lib/supabase';
import { IMAGE_ASSETS } from '@/lib/image-config';

async function migrateMediaToCloudinary() {
  console.log('Starting media migration to Cloudinary...');
  const supabase = createClient();
  
  // 1. Migrate static registry assets
  for (const [id, asset] of Object.entries(IMAGE_ASSETS)) {
    console.log(`Migrating static asset: ${id}`);
    
    const { error } = await supabase
      .from('media_assets')
      .insert({
        public_id: asset.publicId,
        type: asset.type || 'image',
        title: asset.description,
        alt_text: asset.description,
        width: asset.dimensions?.width,
        height: asset.dimensions?.height,
        metadata: {
          legacy_id: id,
          area: asset.area,
          defaultOptions: asset.defaultOptions
        }
      });
      
    if (error) {
      console.error(`Error migrating static asset ${id}:`, error);
    }
  }
  
  // 2. Migrate existing media_assets (from old placeholder system)
  const { data: existingAssets, error: fetchError } = await supabase
    .from('media_assets_old')
    .select('*');
    
  if (fetchError) {
    console.error('Error fetching existing assets:', fetchError);
    return;
  }
  
  for (const asset of existingAssets || []) {
    console.log(`Migrating placeholder asset: ${asset.placeholder_id}`);
    
    const { error } = await supabase
      .from('media_assets')
      .insert({
        public_id: asset.cloudinary_id,
        type: asset.cloudinary_id.includes('video') ? 'video' : 'image',
        title: asset.metadata?.title || asset.placeholder_id,
        alt_text: asset.metadata?.alt_text || asset.placeholder_id,
        metadata: {
          ...asset.metadata,
          legacy_placeholder_id: asset.placeholder_id
        },
        created_at: asset.uploaded_at,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`Error migrating placeholder asset ${asset.placeholder_id}:`, error);
    }
  }
  
  console.log('Migration completed!');
}

migrateMediaToCloudinary().catch(console.error);
```

#### Phase 4: Update Application Code
1. Refactor code to use new components instead of old ones
2. Update references to the media service
3. Replace placeholder usage with direct public IDs

#### Phase 5: Test and Verify
1. Test rendering of images and videos
2. Verify responsive behavior
3. Test optimized image delivery

#### Phase 6: Cleanup
1. Remove deprecated components and services
2. Document new media system

## Implementation Steps

### 1. Component Development

1. **Create Media Components**
   - Implement CldEnhancedImage component
   - Implement CldVideo component
   - Create utility functions for OG images

2. **Create Media Service**
   - Implement new media service with database integration
   - Create methods for handling public IDs directly

### 2. Database Migration

1. **Prepare Database**
   - Ensure media_assets table is created with the schema from Task 2
   - Create temporary tables for migration if needed

2. **Data Migration**
   - Run migration scripts to populate the new media_assets table
   - Map placeholder IDs to public IDs

### 3. Code Migration

1. **Component Migration Strategy**
   - Update selected components first, such as article images
   - Gradually replace components in order of importance
   - Use feature flags if necessary to enable/disable new components

2. **Refactoring Pattern**
   - Implement adapter pattern to support both old and new components during migration
   - Replace placeholder references with public IDs
   - Update props and component imports

### 4. Unit Testing

1. **Component Testing**
   - Create tests for new CldImage and CldVideo components
   - Verify proper rendering and optimization
   - Test responsive behavior

2. **Integration Testing**
   - Test components in the context of pages
   - Verify SEO metadata generation
   - Test server-side rendering

## Possible Challenges and Solutions

### 1. Maintaining Backward Compatibility
- **Challenge**: Existing code relies on the placeholder system
- **Solution**: Create adapter components that support both placeholder IDs and direct public IDs

### 2. Handling Missing Assets
- **Challenge**: Some assets might not be properly migrated
- **Solution**: Implement robust fallback mechanism in the CldImage component

### 3. Performance During Migration
- **Challenge**: Application performance might degrade during migration
- **Solution**: Implement migration in phases and use caching to minimize impact

### 4. SEO Impact
- **Challenge**: URL changes might affect SEO
- **Solution**: Ensure proper metadata and OG images are maintained during migration

## Success Criteria

1. All media assets are properly migrated to the new system
2. CldImage and CldVideo components are implemented and used throughout the application
3. Server-side optimization is properly configured
4. Pages load efficiently with optimized images
5. SEO metadata and OG images are properly generated
6. Application maintains or improves performance after migration 