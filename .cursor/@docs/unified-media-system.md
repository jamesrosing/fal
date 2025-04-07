# Unified Cloudinary Media System - Implementation Plan

## 1. Overview

This document outlines a comprehensive implementation plan for a unified Cloudinary media system that addresses the current challenges with media handling in the application, including:

- Inconsistent approaches to media referencing
- Complex placeholder system
- Mixture of different component usages
- Limited optimization for different devices and viewports
- Lack of a centralized registry for media assets

The solution leverages Cloudinary for storage and delivery while providing a unified API for developers through Next.js components.

## 2. Database Schema

### 2.1 Tables

```sql
-- Media Assets Table
CREATE TABLE IF NOT EXISTS "public"."media_assets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cloudinary_id" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK (type IN ('image', 'video')),
  "title" TEXT,
  "alt_text" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "format" TEXT,
  "url" TEXT,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_media_assets_cloudinary_id ON media_assets(cloudinary_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_metadata_gin ON media_assets USING gin(metadata);

-- Unified Media Placeholders Table
CREATE TABLE IF NOT EXISTS "public"."unified_media_placeholders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "page_path" TEXT,
  "component_path" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_unified_media_placeholders_name ON unified_media_placeholders(name);
CREATE INDEX IF NOT EXISTS idx_unified_media_placeholders_page_path ON unified_media_placeholders(page_path);
CREATE INDEX IF NOT EXISTS idx_unified_media_placeholders_component_path ON unified_media_placeholders(component_path);

-- Unified Media Mappings Table
CREATE TABLE IF NOT EXISTS "public"."unified_media_mappings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "placeholder_id" UUID NOT NULL,
  "media_id" UUID NOT NULL,
  "transformations" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_unified_placeholder FOREIGN KEY (placeholder_id) REFERENCES unified_media_placeholders(id) ON DELETE CASCADE,
  CONSTRAINT fk_unified_media FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE,
  CONSTRAINT unique_unified_placeholder_mapping UNIQUE(placeholder_id)
);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS idx_unified_media_mappings_placeholder_id ON unified_media_mappings(placeholder_id);
CREATE INDEX IF NOT EXISTS idx_unified_media_mappings_media_id ON unified_media_mappings(media_id);
CREATE INDEX IF NOT EXISTS idx_unified_media_mappings_transformations_gin ON unified_media_mappings USING gin(transformations);

-- Add triggers for timestamp updates
CREATE OR REPLACE TRIGGER update_unified_media_placeholders_updated_at
BEFORE UPDATE ON unified_media_placeholders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_unified_media_mappings_updated_at
BEFORE UPDATE ON unified_media_mappings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Relationship Diagram

```
┌─────────────────────────┐        ┌─────────────────────────┐        ┌─────────────────────────┐
│                         │        │                         │        │                         │
│  unified_media_         │        │  unified_media_         │        │  media_assets           │
│  placeholders           │◄───────│  mappings               │◄───────│                         │
│                         │        │                         │        │                         │
└─────────────────────────┘        └─────────────────────────┘        └─────────────────────────┘
```

## 3. Core Components

The following components form the backbone of the unified media system, providing a consistent interface for working with media assets:

### 3.1 Media Service (lib/services/media-service.ts)

```typescript
import { cache } from 'react';
import { createClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Media types
export interface MediaAsset {
  id: string;
  cloudinary_id: string;
  type: 'image' | 'video';
  title?: string;
  alt_text?: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  url?: string;
  format?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaPlaceholder {
  id: string;
  name: string;
  description?: string;
  page_path?: string;
  component_path?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaMapping {
  id: string;
  placeholder_id: string;
  media_id: string;
  transformations?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MediaOptions {
  width?: number | string;
  height?: number | string;
  quality?: number | string;
  format?: string;
  crop?: string;
  gravity?: string;
  resource_type?: 'image' | 'video' | 'auto';
  transformations?: Array<string | Record<string, any>>;
}

class MediaService {
  // Memory cache for frequently accessed data
  private cache = new Map<string, any>();
  
  // Get media asset by placeholder ID or name
  getMediaByPlaceholderId = cache(async (placeholder: string): Promise<MediaAsset | null> => {
    // Check memory cache first
    const cacheKey = `asset:${placeholder}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const supabase = createClient();
    
    // Check if the placeholder is a UUID or a name
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(placeholder);
    
    let data, error;
    
    if (isUuid) {
      // Query by placeholder ID
      ({ data, error } = await supabase
        .from('unified_media_mappings')
        .select(`
          media_id,
          unified_media_placeholders!inner(name),
          media_assets!inner(*)
        `)
        .eq('placeholder_id', placeholder)
        .single());
    } else {
      // Query by placeholder name
      ({ data, error } = await supabase
        .from('unified_media_placeholders')
        .select(`
          id,
          unified_media_mappings!inner(
            media_id,
            media_assets!inner(*)
          )
        `)
        .eq('name', placeholder)
        .single());
    }
    
    if (error || !data) {
      console.error(`Error fetching media for placeholder ${placeholder}:`, error);
      return null;
    }
    
    const asset = isUuid 
      ? data.media_assets 
      : (data.unified_media_mappings && data.unified_media_mappings.length > 0
          ? data.unified_media_mappings[0].media_assets 
          : null);
          
    if (!asset) {
      return null;
    }
    
    // Store in cache for 5 minutes
    this.cache.set(cacheKey, asset);
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
    
    return asset;
  });
  
  // Get all mappings for a specific page
  async getMediaForPage(pagePath: string): Promise<Record<string, MediaAsset>> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('unified_media_placeholders')
      .select(`
        id,
        name,
        unified_media_mappings!inner(
          media_assets:media_id(*)
        )
      `)
      .eq('page_path', pagePath);
    
    if (error || !data) {
      console.error(`Error fetching media for page ${pagePath}:`, error);
      return {};
    }
    
    const result: Record<string, MediaAsset> = {};
    
    data.forEach(placeholder => {
      if (placeholder.unified_media_mappings?.[0]?.media_assets) {
        result[placeholder.name] = placeholder.unified_media_mappings[0].media_assets as MediaAsset;
      }
    });
    
    return result;
  }
  
  // Create a new media placeholder
  async createPlaceholder(
    name: string, 
    description?: string, 
    pagePath?: string, 
    componentPath?: string
  ): Promise<string | null> {
    const supabase = createClient();
    
    // Check if placeholder already exists
    const { data: existing } = await supabase
      .from('unified_media_placeholders')
      .select('id')
      .eq('name', name)
      .single();
    
    if (existing) {
      return existing.id;
    }
    
    // Create new placeholder
    const id = uuidv4();
    const { error } = await supabase
      .from('unified_media_placeholders')
      .insert({
        id,
        name,
        description,
        page_path: pagePath,
        component_path: componentPath,
      });
    
    if (error) {
      console.error('Error creating placeholder:', error);
      return null;
    }
    
    return id;
  }
  
  // Map a media asset to a placeholder
  async createMapping(
    placeholderId: string, 
    mediaId: string, 
    transformations?: Record<string, any>
  ): Promise<boolean> {
    const supabase = createClient();
    
    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('unified_media_mappings')
      .select('id')
      .eq('placeholder_id', placeholderId)
      .single();
    
    if (existing) {
      // Update existing mapping
      const { error } = await supabase
        .from('unified_media_mappings')
        .update({
          media_id: mediaId,
          transformations: transformations || {},
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error('Error updating mapping:', error);
        return false;
      }
    } else {
      // Create new mapping
      const { error } = await supabase
        .from('unified_media_mappings')
        .insert({
          id: uuidv4(),
          placeholder_id: placeholderId,
          media_id: mediaId,
          transformations: transformations || {},
        });
      
      if (error) {
        console.error('Error creating mapping:', error);
        return false;
      }
    }
    
    // Clear cache
    this.cache.delete(`asset:${placeholderId}`);
    
    return true;
  }
  
  // Get a Cloudinary URL with transformations
  getMediaUrl(asset: MediaAsset, options: MediaOptions = {}): string {
    if (!asset.cloudinary_id) {
      return asset.url || '/placeholder-image.jpg';
    }
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
    const resourceType = asset.type === 'video' ? 'video' : 'image';
    
    // Default transformations
    const transformations = [];
    
    // Add format if specified
    if (options.format) {
      transformations.push(`f_${options.format}`);
    } else {
      transformations.push('f_auto');
    }
    
    // Add quality if specified
    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    } else {
      transformations.push('q_auto');
    }
    
    // Add width if specified
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    
    // Add height if specified
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }
    
    // Add crop if specified
    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }
    
    // Add gravity if specified
    if (options.gravity) {
      transformations.push(`g_${options.gravity}`);
    }
    
    // Build the URL
    const transformationString = transformations.join(',');
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformationString}/${asset.cloudinary_id}`;
  }
}

// Export singleton instance
export const mediaService = new MediaService();
```

### 3.2 UnifiedImage Component (components/media/UnifiedImage.tsx)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { mediaService } from '@/lib/services/media-service';

interface UnifiedImageProps {
  placeholderId: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fallbackSrc?: string;
  showLoading?: boolean;
}

export default function UnifiedImage({
  placeholderId,
  alt = '',
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  className = '',
  fallbackSrc = '/placeholder-image.jpg',
  showLoading = true
}: UnifiedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [asset, setAsset] = useState<any>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadAsset() {
      try {
        setLoading(true);
        const result = await mediaService.getMediaByPlaceholderId(placeholderId);
        
        if (isMounted) {
          setAsset(result);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error loading image for ${placeholderId}:`, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }
    
    loadAsset();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId]);
  
  if (loading && showLoading) {
    return (
      <Skeleton
        className={`rounded overflow-hidden ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : width ? `${width * 0.75}px` : '300px',
        }}
      />
    );
  }
  
  if (error || !asset) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt || 'Image not found'}
        width={width || 800}
        height={height || 600}
        className={className}
      />
    );
  }
  
  if (asset.type === 'video') {
    console.warn(`Asset ${placeholderId} is a video but was rendered with UnifiedImage`);
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || 300 }}>
        <p>Video asset</p>
      </div>
    );
  }
  
  // For non-Cloudinary images
  if (!asset.cloudinary_id || asset.cloudinary_id.startsWith('http')) {
    return (
      <Image
        src={asset.url || asset.cloudinary_id}
        alt={alt || asset.alt_text || ''}
        width={width || asset.width || 800}
        height={height || asset.height || 600}
        sizes={sizes}
        priority={priority}
        fill={fill}
        className={className}
      />
    );
  }
  
  // Use CldImage for Cloudinary assets
  return (
    <CldImage
      src={asset.cloudinary_id}
      alt={alt || asset.alt_text || ''}
      width={width || asset.width || 800}
      height={height || asset.height || 600}
      sizes={sizes}
      priority={priority}
      fill={fill}
      className={className}
    />
  );
}
```

### 7.2 PlaceholderManager Component (components/admin/PlaceholderManager.tsx)

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UnifiedImage } from '@/components/media/UnifiedImage';
import { MediaRenderer } from '@/components/media/MediaRenderer';
import MediaManager from './MediaManager';

interface PlaceholderManagerProps {
  pageFilter?: string;
}

export default function PlaceholderManager({ pageFilter }: PlaceholderManagerProps) {
  const [plac

## 5. Scanning and Migration

### 5.1 Scan for Placeholder Usage (scripts/scan-media-placeholders.js)

```javascript
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { createClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Patterns to look for
const PLACEHOLDER_PATTERNS = [
  /placeholderId=["']([^"']+)["']/g,
  /getMediaByPlaceholderId\(["']([^"']+)["']\)/g,
];

async function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const componentPath = filePath;
  const isPage = filePath.includes('/app/') && (filePath.includes('/page.tsx') || filePath.includes('/page.jsx'));
  
  // Extract page path for page components
  let pagePath = null;
  if (isPage) {
    pagePath = filePath
      .replace(/^.*\/app\//, '/')
      .replace(/\/page\.(tsx|jsx|js|ts)$/, '')
      .replace(/\/\(.*?\)\//, '/');
      
    // Handle index/root pages
    if (pagePath === '/') {
      pagePath = '/';
    }
  }
  
  const placeholders = [];
  
  // Check for placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      
      // Add if not already found
      if (!placeholders.some(p => p.name === name)) {
        placeholders.push({
          name,
          description: `Found in ${filePath}`,
          page_path: pagePath,
          component_path: componentPath,
        });
      }
    }
  }
  
  return placeholders;
}

async function scanDirectory(dir) {
  console.log(`Scanning ${dir}...`);
  const files = await glob(`${dir}/**/*.{tsx,jsx,js,ts}`);
  console.log(`Found ${files.length} files`);
  
  const allPlaceholders = [];
  
  for (const file of files) {
    const placeholders = await scanFile(file);
    allPlaceholders.push(...placeholders);
  }
  
  return allPlaceholders;
}

async function savePlaceholders(placeholders) {
  const supabase = createClient();
  let saved = 0;
  
  for (const placeholder of placeholders) {
    // Check if exists
    const { data: existing } = await supabase
      .from('unified_media_placeholders')
      .select('id')
      .eq('name', placeholder.name)
      .single();
      
    if (!existing) {
      // Insert new
      const { error } = await supabase
        .from('unified_media_placeholders')
        .insert({
          id: uuidv4(),
          ...placeholder,
        });
        
      if (error) {
        console.error(`Error saving ${placeholder.name}:`, error);
      } else {
        saved++;
      }
    }
  }
  
  return saved;
}

async function main() {
  console.log('Scanning application for media placeholders...');
  
  const appPlaceholders = await scanDirectory('./app');
  const componentPlaceholders = await scanDirectory('./components');
  
  const allPlaceholders = [...appPlaceholders, ...componentPlaceholders];
  
  console.log(`Found ${allPlaceholders.length} unique placeholders`);
  
  // Save to database
  const saved = await savePlaceholders(allPlaceholders);
  console.log(`Saved ${saved} new placeholders to database`);
  
  // Save to file for reference
  fs.writeFileSync('placeholders.json', JSON.stringify(allPlaceholders, null, 2));
  console.log('Placeholder list saved to placeholders.json');
}

main().catch(console.error);
```

### 5.2 Component Migration Helper (scripts/migrate-components.js)

```javascript
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Migration patterns
const PATTERNS = [
  // Replace <Image> with <UnifiedImage>
  {
    pattern: /<Image\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    replacer: (match, pre, src, post) => {
      // Skip if already converted
      if (match.includes('UnifiedImage') || match.includes('placeholderId')) {
        return match;
      }
      
      // Extract properties
      const altMatch = match.match(/alt=["']([^"']*)["']/);
      const widthMatch = match.match(/width=[\{"]([^}"]+)[\}"]/);
      const heightMatch = match.match(/height=[\{"]([^}"]+)[\}"]/);
      const priorityMatch = match.includes('priority');
      const fillMatch = match.includes('fill');
      const classNameMatch = match.match(/className=["']([^"']*)["']/);
      
      const alt = altMatch ? `alt="${altMatch[1]}"` : '';
      const width = widthMatch ? `width={${widthMatch[1]}}` : '';
      const height = heightMatch ? `height={${heightMatch[1]}}` : '';
      const priority = priorityMatch ? 'priority' : '';
      const fill = fillMatch ? 'fill' : '';
      const className = classNameMatch ? `className="${classNameMatch[1]}"` : '';
      
      // Extract placeholder ID from src
      let placeholderId = src.split('/').pop();
      if (placeholderId) {
        placeholderId = placeholderId.split('.')[0];
      } else {
        placeholderId = `placeholder-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      return `<UnifiedImage placeholderId="${placeholderId}" ${alt} ${width} ${height} ${priority} ${fill} ${className} />`;
    }
  },
  
  // Replace <video> with <UnifiedVideo>
  {
    pattern: /<video\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>([^<]*)<\/video>/g,
    replacer: (match, pre, src, post, inner) => {
      // Skip if already converted
      if (match.includes('UnifiedVideo') || match.includes('placeholderId')) {
        return match;
      }
      
      // Extract properties
      const autoPlayMatch = match.includes('autoPlay') || match.includes('autoplay');
      const mutedMatch = match.includes('muted');
      const loopMatch = match.includes('loop');
      const controlsMatch = match.includes('controls');
      const classNameMatch = match.match(/className=["']([^"']*)["']/);
      const posterMatch = match.match(/poster=["']([^"']*)["']/);
      
      const autoPlay = autoPlayMatch ? 'autoPlay={true}' : '';
      const muted = mutedMatch ? 'muted={true}' : '';
      const loop = loopMatch ? 'loop={true}' : '';
      const controls = controlsMatch ? 'controls={true}' : '';
      const className = classNameMatch ? `className="${classNameMatch[1]}"` : '';
      const poster = posterMatch ? `posterPlaceholderId="${posterMatch[1]}"` : '';
      
      // Extract placeholder ID from src
      let placeholderId = src.split('/').pop();
      if (placeholderId) {
        placeholderId = placeholderId.split('.')[0];
      } else {
        placeholderId = `video-placeholder-${Math.random().toString(36).substring(2, 9)}`;
      }
      
      return `<UnifiedVideo placeholderId="${placeholderId}" ${autoPlay} ${muted} ${loop} ${controls} ${className} ${poster} />`;
    }
  }
];

// Add imports to file
function addImports(content) {
  // Skip if already has imports
  if (content.includes('UnifiedImage') && content.includes('UnifiedVideo')) {
    return content;
  }
  
  // Find the last import line
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  
  if (importLines.length === 0) {
    return content;
  }
  
  const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]) + 
    importLines[importLines.length - 1].length;
  
  const newImports = `
import UnifiedImage from '@/components/media/UnifiedImage';
import UnifiedVideo from '@/components/media/UnifiedVideo';
`;
  
  return content.substring(0, lastImportIndex) + newImports + content.substring(lastImportIndex);
}

// Process a single file
async function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Apply each replacement pattern
  for (const { pattern, replacer } of PATTERNS) {
    newContent = newContent.replace(pattern, replacer);
  }
  
  // Only make changes if something was updated
  if (newContent !== content) {
    // Add imports
    newContent = addImports(newContent);
    
    // Write file
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated ${filePath}`);
    return true;
  } else {
    console.log(`⏭️ No changes needed in ${filePath}`);
    return false;
  }
}

// Process directories
async function main() {
  // Find all React files
  const files = glob.sync('./app/**/*.{tsx,jsx}').concat(
    glob.sync('./components/**/*.{tsx,jsx}')
  );
  
  console.log(`Found ${files.length} files to process`);
  
  let updated = 0;
  
  // Process each file
  for (const file of files) {
    if (await processFile(file)) {
      updated++;
    }
  }
  
  console.log(`\nMigration complete! Updated ${updated} of ${files.length} files.`);
}

main().catch(console.error);
```

## 6. Implementation Strategy

### 6.1 Phase 1: Setup (Week 1)

1. **Create Database Tables**
   - Run the SQL to create tables
   - Verify table structure and relationships

2. **Implement Core Services**
   - Create the `mediaService` class
   - Setup Cloudinary configuration

3. **Create Basic Components**
   - Implement `UnifiedImage`
   - Implement `UnifiedVideo`
   - Implement `MediaRenderer`

### 6.2 Phase 2: Scanning and Population (Week 2)

1. **Scan for Placeholders**
   - Run placeholder scanning script
   - Review and validate results

2. **Register Media Assets**
   - Upload initial assets to Cloudinary
   - Register assets in the database

3. **Create Mappings**
   - Map placeholders to media assets
   - Verify mappings in admin interface

### 6.3 Phase 3: Component Migration (Week 3)

1. **Test Migration Tools**
   - Run migration on a small set of components
   - Verify transformation quality

2. **Migrate High-Priority Components**
   - Hero sections
   - Landing page components
   - Frequently used shared components

3. **Full Migration**
   - Migrate all remaining components
   - Run automated tests to verify functionality

### 6.4 Phase 4: Admin Interface and Optimization (Week 4)

1. **Admin Interface Development**
   - Create media management screens
   - Build placeholder assignment interface

2. **Performance Optimization**
   - Implement caching strategies
   - Fine-tune Cloudinary transformations

3. **Documentation and Training**
   - Create developer guide
   - Provide training on the new system

## 7. Admin Interface Components

The following components provide the admin interface for managing media assets and placeholders:

### 7.1 MediaManager Component (components/admin/MediaManager.tsx)

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedImage } from '@/components/media/UnifiedImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { mediaService } from '@/lib/services/media-service';

interface MediaManagerProps {
  onSelect?: (mediaId: string) => void;
  selectedId?: string;
  type?: 'image' | 'video' | 'all';
  placeholderId?: string;
}

export default function MediaManager({ 
  onSelect, 
  selectedId,
  type = 'all',
  placeholderId
}: MediaManagerProps) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(
    type === 'all' ? undefined : type as 'image' | 'video'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': mediaType === 'video' || mediaType === undefined ? [] : []
    },
    onDrop: handleFileUpload,
    disabled: uploading
  });
  
  useEffect(() => {
    loadAssets();
  }, [mediaType, searchQuery, currentPage]);
  
  useEffect(() => {
    if (selectedId) {
      fetchSelectedAsset();
    }
  }, [selectedId]);
  
  async function loadAssets() {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/unified-media/assets?type=${mediaType || ''}&page=${currentPage}&query=${searchQuery}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
        setTotalPages(data.totalPages);
      } else {
        console.error('Error loading assets:', await response.text());
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchSelectedAsset() {
    try {
      const response = await fetch(`/api/unified-media/assets/${selectedId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedAsset(data);
      }
    } catch (error) {
      console.error('Error fetching selected asset:', error);
    }
  }
  
  async function handleFileUpload(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add metadata
        formData.append('title', file.name);
        formData.append('alt', file.name);
        
        // Add placeholderId if provided
        if (placeholderId) {
          formData.append('placeholderId', placeholderId);
        }
        
        // Upload
        const response = await fetch('/api/unified-media', {
          method: 'PUT',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // If this is the first file and we need to select it
        if (acceptedFiles.length === 1 && onSelect) {
          onSelect(data.asset.id);
          setSelectedAsset(data.asset);
        }
      }
      
      // Reload assets
      loadAssets();
      
      // Close dialog
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  }
  
  function handleAssetSelect(asset: any) {
    setSelectedAsset(asset);
    
    if (onSelect) {
      onSelect(asset.id);
    }
    
    // If placeholderId is provided, map the asset to it
    if (placeholderId && asset) {
      mapAssetToPlaceholder(asset.id, placeholderId);
    }
  }
  
  async function mapAssetToPlaceholder(assetId: string, placeholderId: string) {
    try {
      const response = await fetch('/api/unified-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          placeholderId,
          mediaId: assetId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mapping failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error mapping asset to placeholder:', error);
    }
  }
  
  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }
  
  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <Select value={mediaType || 'all'} onValueChange={(v) => setMediaType(v === 'all' ? undefined : v as 'image' | 'video')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
          Upload
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map(asset => (
              <Card 
                key={asset.id} 
                className={`cursor-pointer overflow-hidden ${
                  selectedAsset?.id === asset.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleAssetSelect(asset)}
              >
                <CardContent className="p-0 h-32 bg-gray-100">
                  {asset.type === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.title || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>Video</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-2 text-xs truncate">
                  {asset.title || asset.cloudinary_id.split('/').pop()}
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage <= 1}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="outline" onClick={handleNextPage} disabled={currentPage >= totalPages}>
              Next
            </Button>
          </div>
        </>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <p>Uploading...</p>
            ) : (
              <p>
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag and drop files here, or click to select files'}
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

### 3.3 UnifiedVideo Component (components/media/UnifiedVideo.tsx)

```typescript
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CldVideoPlayer } from 'next-cloudinary';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { mediaService } from '@/lib/services/media-service';

interface UnifiedVideoProps {
  placeholderId: string;
  posterPlaceholderId?: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  fallbackSrc?: string;
  showLoading?: boolean;
}

export default function UnifiedVideo({
  placeholderId,
  posterPlaceholderId,
  width,
  height,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  className = '',
  fallbackSrc,
  showLoading = true
}: UnifiedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [asset, setAsset] = useState<any>(null);
  const [posterAsset, setPosterAsset] = useState<any>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadAssets() {
      try {
        setLoading(true);
        
        // Load video asset
        const videoAsset = await mediaService.getMediaByPlaceholderId(placeholderId);
        
        // Load poster asset if provided
        let poster = null;
        if (posterPlaceholderId) {
          poster = await mediaService.getMediaByPlaceholderId(posterPlaceholderId);
        }
        
        if (isMounted) {
          setAsset(videoAsset);
          if (poster) setPosterAsset(poster);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error loading video for ${placeholderId}:`, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }
    
    loadAssets();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId, posterPlaceholderId]);
  
  if (loading && showLoading) {
    return (
      <Skeleton
        className={`rounded overflow-hidden ${className}`}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : width ? `${width * 0.5625}px` : '300px',
        }}
      />
    );
  }
  
  if (error || !asset) {
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt="Video thumbnail"
          width={width || 800}
          height={height || 450}
          className={className}
        />
      );
    }
    return null;
  }
  
  if (asset.type === 'image') {
    console.warn(`Asset ${placeholderId} is an image but was rendered with UnifiedVideo`);
    return (
      <Image
        src={asset.url || asset.cloudinary_id}
        alt="Video thumbnail"
        width={width || asset.width || 800}
        height={height || asset.height || 450}
        className={className}
      />
    );
  }
  
  // Get poster URL if available
  const posterUrl = posterAsset ? 
    (posterAsset.cloudinary_id ? mediaService.getMediaUrl(posterAsset) : posterAsset.url) : 
    undefined;
  
  // For non-Cloudinary videos
  if (!asset.cloudinary_id || asset.cloudinary_id.startsWith('http')) {
    return (
      <video
        ref={videoRef}
        src={asset.url || asset.cloudinary_id}
        poster={posterUrl}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        className={className}
      >
        Your browser does not support the video tag.
      </video>
    );
  }
  
  // Use Cloudinary video player
  return (
    <CldVideoPlayer
      id={`video-${placeholderId}`}
      width={width}
      height={height}
      src={asset.cloudinary_id}
      poster={posterUrl}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      className={className}
    />
  );
}
```

### 3.4 MediaRenderer Component (components/media/MediaRenderer.tsx)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import UnifiedImage from './UnifiedImage';
import UnifiedVideo from './UnifiedVideo';
import { mediaService } from '@/lib/services/media-service';

interface MediaRendererProps {
  placeholderId: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  fallbackSrc?: string;
  showLoading?: boolean;
}

export default function MediaRenderer({
  placeholderId,
  alt = '',
  width,
  height,
  fill = false,
  priority = false,
  sizes = '100vw',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  className = '',
  fallbackSrc,
  showLoading = true
}: MediaRendererProps) {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  
  useEffect(() => {
    let isMounted = true;
    
    async function detectMediaType() {
      try {
        const asset = await mediaService.getMediaByPlaceholderId(placeholderId);
        if (isMounted && asset) {
          setMediaType(asset.type as 'image' | 'video');
        }
      } catch (err) {
        console.error(`Error detecting media type for ${placeholderId}:`, err);
        if (isMounted) {
          setMediaType('unknown');
        }
      }
    }
    
    detectMediaType();
    
    return () => {
      isMounted = false;
    };
  }, [placeholderId]);
  
  if (mediaType === 'video') {
    return (
      <UnifiedVideo
        placeholderId={placeholderId}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        className={className}
        fallbackSrc={fallbackSrc}
        showLoading={showLoading}
      />
    );
  }
  
  // For images or unknown media type (default to image)
  return (
    <UnifiedImage
      placeholderId={placeholderId}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      fallbackSrc={fallbackSrc}
      showLoading={showLoading}
    />
  );
}
```

## 4. API Implementation

### 4.1 Unified Media API (app/api/unified-media/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET handler for fetching media
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const page = searchParams.get('page');
  
  const supabase = createClient();
  
  if (id) {
    // Get by ID
    const { data, error } = await supabase
      .from('unified_media_placeholders')
      .select(`
        *,
        unified_media_mappings(
          *,
          media_assets(*)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(data);
  }
  
  if (name) {
    // Get by name
    const { data, error } = await supabase
      .from('unified_media_placeholders')
      .select(`
        *,
        unified_media_mappings(
          *,
          media_assets(*)
        )
      `)
      .eq('name', name)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(data);
  }
  
  if (page) {
    // Get all for a page
    const { data, error } = await supabase
      .from('unified_media_placeholders')
      .select(`
        *,
        unified_media_mappings(
          *,
          media_assets(*)
        )
      `)
      .eq('page_path', page);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Format for easier consumption
    const formatted = {};
    
    data.forEach(item => {
      if (item.unified_media_mappings && item.unified_media_mappings.length > 0) {
        formatted[item.name] = item.unified_media_mappings[0].media_assets;
      }
    });
    
    return NextResponse.json(formatted);
  }
  
  // Return all placeholders
  const { data, error } = await supabase
    .from('unified_media_placeholders')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST handler for creating/updating media
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, pagePath, componentPath, mediaId } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const supabase = createClient();
    
    // Check if placeholder exists
    const { data: existing, error: queryError } = await supabase
      .from('unified_media_placeholders')
      .select('id')
      .eq('name', name)
      .single();
    
    let placeholderId;
    
    if (queryError || !existing) {
      // Create new placeholder
      const id = uuidv4();
      const { error: insertError } = await supabase
        .from('unified_media_placeholders')
        .insert({
          id,
          name,
          description,
          page_path: pagePath,
          component_path: componentPath,
        });
        
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      
      placeholderId = id;
    } else {
      placeholderId = existing.id;
    }
    
    // Create mapping if mediaId is provided
    if (mediaId) {
      const { error: mappingError } = await supabase
        .from('unified_media_mappings')
        .upsert({
          id: uuidv4(),
          placeholder_id: placeholderId,
          media_id: mediaId,
          transformations: body.transformations || {},
        }, {
          onConflict: 'placeholder_id'
        });
        
      if (mappingError) {
        return NextResponse.json({ error: mappingError.message }, { status: 500 });
      }
    }
    
    return NextResponse.json({ id: placeholderId });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Upload endpoint for media files
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get form values
    const title = formData.get('title') as string || file.name;
    const alt = formData.get('alt') as string || title;
    const placeholderId = formData.get('placeholderId') as string;
    const folder = formData.get('folder') as string || 'uploads';
    
    // Convert file to buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create base64 data URI
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    // Save to database
    const supabase = createClient();
    
    // Create asset in database
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .insert({
        id: uuidv4(),
        cloudinary_id: uploadResult.public_id,
        type: uploadResult.resource_type === 'video' ? 'video' : 'image',
        title,
        alt_text: alt,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        url: uploadResult.secure_url,
        metadata: {
          original_filename: file.name,
          bytes: uploadResult.bytes,
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();
      
    if (assetError) {
      return NextResponse.json({ error: assetError.message }, { status: 500 });
    }
    
    // Create mapping if placeholderId is provided
    if (placeholderId) {
      const { error: mappingError } = await supabase
        .from('unified_media_mappings')
        .upsert({
          id: uuidv4(),
          placeholder_id: placeholderId,
          media_id: asset.id,
          transformations: {},
        }, {
          onConflict: 'placeholder_id'
        });
        
      if (mappingError) {
        return NextResponse.json({ error: mappingError.message }, { status: 500 });
      }
    }
    
    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing media mappings
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeholderId = searchParams.get('placeholderId');
  
  if (!placeholderId) {
    return NextResponse.json({ error: 'placeholderId is required' }, { status: 400 });
  }
  
  const supabase = createClient();
  
  // Delete mapping
  const { error } = await supabase
    .from('unified_media_mappings')
    .delete()
    .eq('placeholder_id', placeholderId);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}