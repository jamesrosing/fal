# Allure MD Project Cleanup Instructions

This document provides detailed instructions for cleaning up the Allure MD project to align with the enhanced PRD. The cleanup focuses on removing duplicate code, consolidating media systems, and implementing the optimal architecture described in the PRD.

## 1. Media System Consolidation

### 1.1 Remove Deprecated Components
1. Delete the following files:
   ```bash
   # Remove deprecated media components
   rm components/media/OptimizedImage.tsx
   rm components/media/OptimizedVideo.tsx
   rm components/media/ServerImage.tsx
   rm components/CloudinaryImage.tsx
   rm components/CloudinaryVideo.tsx
   ```

2. Keep only:
   ```
   components/media/UnifiedImage.tsx
   components/media/UnifiedVideo.tsx
   components/media/MediaRenderer.tsx
   ```

### 1.2 Migrate to Single Media Service
1. Remove static registry:
   ```bash
   rm lib/image-config.js
   rm lib/media/registry.ts
   ```

2. Update `lib/services/media-service.ts` to remove registry dependencies:
   ```typescript
   // Remove these lines
   import mediaRegistry from '@/lib/media/registry';
   
   // Update getMediaByPlaceholderId to query database only
   getMediaByPlaceholderId = cache(async (placeholderId: string): Promise<MediaAsset | null> => {
     const supabase = createClient();
     
     // First get the mapping
     const { data: mapping, error: mappingError } = await supabase
       .from('media_mappings')
       .select('media_id')
       .eq('placeholder_id', placeholderId)
       .single();
       
     if (mappingError || !mapping) {
       console.error(`Error fetching mapping for placeholder ${placeholderId}:`, mappingError);
       return null;
     }
     
     // Then get the media asset
     const { data: mediaAsset, error: mediaError } = await supabase
       .from('media_assets')
       .select('*')
       .eq('id', mapping.media_id)
       .single();
       
     if (mediaError || !mediaAsset) {
       console.error(`Error fetching media asset ${mapping.media_id}:`, mediaError);
       return null;
     }
     
     return mediaAsset as MediaAsset;
   });
   ```

### 1.3 Update Component Usage
1. Search and replace all instances of `OptimizedImage` with `UnifiedImage`
2. Search and replace all instances of `OptimizedVideo` with `UnifiedVideo`
3. Search and replace all instances of `CloudinaryImage` with `UnifiedImage`

```bash
# Example search and replace
find . -type f -name "*.tsx" -exec sed -i 's/OptimizedImage/UnifiedImage/g' {} +
find . -type f -name "*.tsx" -exec sed -i 's/OptimizedVideo/UnifiedVideo/g' {} +
find . -type f -name "*.tsx" -exec sed -i 's/CloudinaryImage/UnifiedImage/g' {} +
```

## 2. Remove Migration Artifacts

### 2.1 Clean Up Temporary Files
```bash
rm -rf temp-migration/
rm cloudinary-migration-map.json
rm cloudinary-replacement-map.json
rm media-assets-report.json
rm media-audit-analysis.json
rm media-audit-results.json
rm media-verification-report.json
rm migration-summary.md
rm unmigrated-components-report.json
```

### 2.2 Consolidate Documentation
```bash
# Remove duplicate documentation
rm media-placement-system.md

# Keep only the main documentation
# MEDIA-SYSTEM.md should be updated to reflect the unified system
```

## 3. Configuration Cleanup

### 3.1 Remove Backup Files
```bash
rm .eslintrc.json.bak
```

### 3.2 Update Configuration Files
Update `.eslintrc.json` to ensure proper TypeScript configuration:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "@next/next/no-img-element": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/no-unescaped-entities": "off",
    "prefer-const": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-key": "error",
    "import/no-duplicates": "error"
  }
}
```

## 4. Database Migration

### 4.1 Create Migration Script
Create `scripts/migrate-to-unified-media.ts`:
```typescript
import { createClient } from '@/lib/supabase';
import { IMAGE_ASSETS } from '../lib/image-config';

async function migrateMediaAssets() {
  const supabase = createClient();
  
  // Migrate assets from static registry to database
  for (const [id, asset] of Object.entries(IMAGE_ASSETS)) {
    // Check if asset already exists
    const { data: existing } = await supabase
      .from('media_assets')
      .select('id')
      .eq('cloudinary_id', asset.publicId)
      .single();
    
    if (!existing) {
      // Insert new asset
      const { error: assetError } = await supabase
        .from('media_assets')
        .insert({
          cloudinary_id: asset.publicId,
          type: asset.type,
          title: asset.description,
          alt_text: asset.description,
          width: asset.dimensions?.width,
          height: asset.dimensions?.height,
          metadata: {
            area: asset.area,
            defaultOptions: asset.defaultOptions
          }
        });
      
      if (assetError) {
        console.error(`Error inserting asset ${id}:`, assetError);
        continue;
      }
    }
    
    // Create mapping if not exists
    const { data: mediaAsset } = await supabase
      .from('media_assets')
      .select('id')
      .eq('cloudinary_id', asset.publicId)
      .single();
    
    if (mediaAsset) {
      const { error: mappingError } = await supabase
        .from('media_mappings')
        .upsert({
          placeholder_id: id,
          media_id: mediaAsset.id
        }, {
          onConflict: 'placeholder_id'
        });
      
      if (mappingError) {
        console.error(`Error creating mapping for ${id}:`, mappingError);
      }
    }
  }
}

migrateMediaAssets().catch(console.error);
```

Run the migration:
```bash
npm run ts-node scripts/migrate-to-unified-media.ts
```

## 5. Implement React Query

### 5.1 Install Dependencies
```bash
npm install @tanstack/react-query
```

### 5.2 Create Query Provider
Create `providers/query-provider.tsx`:
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 5.3 Update Root Layout
Update `app/layout.tsx`:
```typescript
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## 6. Implement Caching Strategy

### 6.1 Set up Redis
Create `.env.local` variables:
```env
REDIS_URL=redis://localhost:6379
```

### 6.2 Create Redis Client
Create `lib/redis.ts`:
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCachedData(key: string, data: any, ttl: number = 3600): Promise<void> {
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
}

export default redis;
```

## 7. Update Project Structure

### 7.1 Reorganize Directories
```bash
# Create new structure
mkdir -p app/\(admin\)/admin
mkdir -p app/\(public\)
mkdir -p lib/services
mkdir -p lib/hooks
mkdir -p lib/utils

# Move admin routes
mv app/admin/* app/\(admin\)/admin/

# Move public routes
mv app/articles app/\(public\)/
mv app/gallery app/\(public\)/
mv app/services app/\(public\)/
```

## 8. Fix TypeScript Issues

### 8.1 Remove 'any' Types
Search for all occurrences of `any` and replace with proper types:
```bash
# Find all files with 'any' type
grep -r ": any" --include="*.ts" --include="*.tsx" .
```

### 8.2 Create Type Definitions
Create proper interfaces in `types/index.ts`:
```typescript
export interface MediaAsset {
  id: string;
  cloudinary_id: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  metadata?: Record<string, unknown>;
  width?: number;
  height?: number;
  format?: string;
  created_at: string;
  updated_at: string;
}

// Add more interfaces...
```

## 9. Performance Optimization

### 9.1 Implement ISR for Articles
Update article pages to use ISR:
```typescript
// app/(public)/articles/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

### 9.2 Add Image Optimization
Update `next.config.ts`:
```typescript
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

## 10. SEO Improvements

### 10.1 Create Dynamic Sitemap
Create `app/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all articles, galleries, etc.
  const articles = await fetchAllArticles();
  
  return [
    {
      url: 'https://alluremd.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...articles.map(article => ({
      url: `https://alluremd.com/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
```

### 10.2 Add Structured Data
Create components for structured data:
```typescript
// components/seo/ArticleSchema.tsx
export function ArticleSchema({ article }: { article: Article }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Person",
      "name": article.author.name
    },
    // ... more properties
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

## 11. Final Verification

### 11.1 Run Linting and Type Checking
```bash
npm run lint
npm run type-check
```

### 11.2 Test All Media Components
Create a test page to verify all media components work correctly.

### 11.3 Performance Audit
Run Lighthouse audit to ensure performance targets are met.

## 12. Documentation Update

### 12.1 Update Main Documentation
Update `MEDIA-SYSTEM.md` to reflect the new unified system.

### 12.2 Create Migration Guide
Document the changes for other developers.

## Checklist

- [ ] Remove all deprecated media components
- [ ] Migrate to single media service
- [ ] Update all component usage
- [ ] Remove migration artifacts
- [ ] Clean up configuration files
- [ ] Run database migration
- [ ] Implement React Query
- [ ] Set up caching
- [ ] Reorganize project structure
- [ ] Fix TypeScript issues
- [ ] Implement performance optimizations
- [ ] Add SEO improvements
- [ ] Run final verification
- [ ] Update documentation

This cleanup process will align the project with the enhanced PRD and establish a solid foundation for future development.
