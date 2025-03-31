# Fal Project - Media Refactoring Plan

## Table of Contents

- [Introduction](#introduction)
- [Current State Assessment](#current-state-assessment)
- [Phase 1: Assessment and Setup](#phase-1-assessment-and-setup)
  - [Core Media Types](#core-media-types)
  - [Media Registry System](#media-registry-system)
  - [Media Utility Functions](#media-utility-functions)
- [Phase 2: Create Core Media Components](#phase-2-create-core-media-components)
  - [OptimizedImage Component](#optimizedimage-component)
  - [OptimizedVideo Component](#optimizedvideo-component)
  - [MediaRenderer Component](#mediarenderer-component)
- [Phase 3: Create Media API and Server Components](#phase-3-create-media-api-and-server-components)
  - [Media API Endpoint](#media-api-endpoint)
  - [Media Proxy Endpoint](#media-proxy-endpoint)
- [Phase 4: Implementation Plan for Existing App](#phase-4-implementation-plan-for-existing-app)
  - [Migration Script](#migration-script)
  - [Implementing One Component at a Time](#implementing-one-component-at-a-time)
- [Phase 5: Testing and Deployment](#phase-5-testing-and-deployment)
  - [Verification Script](#verification-script)
  - [End-to-End Testing](#end-to-end-testing)
  - [Component Development in Isolation](#component-development-in-isolation)
  - [Rollout Strategy](#rollout-strategy)
- [Phase 6: Practical Refactoring Examples](#phase-6-practical-refactoring-examples)
  - [Refactoring Background Video Component](#refactoring-background-video-component)
  - [Refactoring Media Image Component](#refactoring-media-image-component)
  - [Refactoring Hero Section](#refactoring-hero-section)
  - [Priority Areas for Refactoring](#priority-areas-for-refactoring)
- [Phase 7: Documentation and Maintenance](#phase-7-documentation-and-maintenance)
  - [Media System Documentation](#media-system-documentation)
  - [Maintenance Processes](#maintenance-processes)
- [Conclusion](#conclusion)

## Introduction

This document outlines a comprehensive plan for refactoring the media handling in the Fal project. The goal is to create a more consistent, maintainable, and performant media system that leverages Cloudinary for storage and delivery while providing a unified API for developers.

## Current State Assessment

Based on the audit of the current codebase, we've identified several issues with media handling:

- Inconsistent approaches to media referencing (direct URLs, asset IDs)
- Mixture of Next.js Image components and standard HTML
- Redundant code for similar media handling tasks
- Limited optimization for different devices and viewports
- No centralized registry of media assets

The audit found approximately 116 media usages across the codebase with the following patterns:
- 62 instances of Next.js `<Image>` component
- 36 instances of `src` attributes
- 10 instances of `<video>` elements
- 6 instances of `<img>` elements

## Phase 1: Assessment and Setup

### Core Media Types

```typescript
// lib/media/types.ts
export type MediaType = 'image' | 'video';
export type MediaArea = 'hero' | 'article' | 'service' | 'team' | 'gallery' | 'logo' | 'video-thumbnail';
export type ImageFormat = 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
export type VideoFormat = 'mp4' | 'webm' | 'mov';

export interface MediaAsset {
  id: string;
  type: MediaType;
  area: MediaArea;
  description: string;
  publicId: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  defaultOptions: {
    width: number;
    quality: number;
    format?: ImageFormat;
  };
}

export interface MediaPlacement {
  path: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  transformations: string[];
}

export interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  crop?: string;
  gravity?: string;
  simplifiedMode?: boolean;
  resource_type?: 'image' | 'video' | 'auto' | 'raw';
  alt?: string;
}

export interface VideoOptions {
  format?: VideoFormat;
  quality?: number;
  width?: number;
  height?: number;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}
```

### Media Registry System

```typescript
// lib/media/registry.ts
import { MediaAsset, MediaArea, MediaPlacement } from './types';

// Define placements for different media areas
export const MEDIA_PLACEMENTS: Record<MediaArea, MediaPlacement> = {
  hero: {
    path: "hero",
    description: "Main hero images for section headers",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  article: {
    path: "articles",
    description: "Article header images",
    dimensions: {
      width: 1200,
      height: 675,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  service: {
    path: "services",
    description: "Service category images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  team: {
    path: "team/headshots",
    description: "Team member headshots",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    transformations: ["c_fill", "g_face", "f_auto", "q_auto"]
  },
  gallery: {
    path: "gallery",
    description: "Gallery images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  logo: {
    path: "branding",
    description: "Logo and branding assets",
    dimensions: {
      width: 200,
      height: 0,
      aspectRatio: 0
    },
    transformations: ["c_scale", "f_auto", "q_auto"]
  },
  "video-thumbnail": {
    path: "videos/thumbnails",
    description: "Thumbnails for videos",
    dimensions: {
      width: 1280,
      height: 720,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  }
};

// Create a centralized media registry
class MediaRegistry {
  private assets: Map<string, MediaAsset> = new Map();
  
  registerAsset(asset: MediaAsset): void {
    this.assets.set(asset.id, asset);
  }
  
  registerBulk(assets: MediaAsset[]): void {
    assets.forEach(asset => this.registerAsset(asset));
  }
  
  getAsset(id: string): MediaAsset | undefined {
    return this.assets.get(id);
  }
  
  getAllAssets(): MediaAsset[] {
    return Array.from(this.assets.values());
  }
  
  getAssetsByArea(area: MediaArea): MediaAsset[] {
    return this.getAllAssets().filter(asset => asset.area === area);
  }
  
  updateAsset(id: string, updates: Partial<MediaAsset>): void {
    const asset = this.getAsset(id);
    if (asset) {
      this.assets.set(id, { ...asset, ...updates });
    }
  }
}

// Create singleton instance
export const mediaRegistry = new MediaRegistry();

// Pre-register all known assets
import { IMAGE_ASSETS } from '../image-config';
Object.values(IMAGE_ASSETS).forEach(asset => {
  mediaRegistry.registerAsset({
    ...asset,
    type: 'image',
  });
});

export default mediaRegistry;
```

### Media Utility Functions

```typescript
// lib/media/utils.ts
import { MediaOptions, VideoOptions, MediaAsset } from './types';
import mediaRegistry from './registry';

// Environment config
const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
};

/**
 * Creates a properly formatted media URL with transformations
 */
export function getMediaUrl(
  idOrPublicId: string,
  options: MediaOptions = {}
): string {
  // Check if it's an asset ID first
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  // If already a full URL, return as is
  if (publicId.startsWith('http')) {
    return publicId;
  }
  
  // Handle missing values
  if (!publicId) {
    console.warn('Empty publicId provided, returning placeholder');
    return 'https://via.placeholder.com/800x600?text=Image+Not+Found';
  }
  
  // For images
  const {
    width = asset?.defaultOptions.width || 'auto',
    height = 'auto',
    quality = asset?.defaultOptions.quality || 90,
    format = asset?.defaultOptions.format || 'auto',
    crop = 'scale',
    gravity = 'auto',
    resource_type = asset?.type || 'image'
  } = options;
  
  // Build transformation string
  const transformations = `f_${format},q_${quality}${width !== 'auto' ? `,w_${width}` : ''}`;
  
  // Construct Cloudinary URL
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName || 'demo'}/${resource_type}/upload/${transformations}/${publicId}`;
}

/**
 * Get video sources for different formats and resolutions
 */
export function getVideoSources(
  idOrPublicId: string,
  options: {
    formats?: string[];
    widths?: number[];
    baseOptions?: VideoOptions;
  } = {}
): Array<{ src: string; type: string; media?: string }> {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const formats = options.formats || ['mp4', 'webm'];
  const widths = options.widths || [480, 720, 1080];
  const baseOptions = options.baseOptions || {};
  
  return formats.flatMap(format => 
    widths.map(width => ({
      src: getMediaUrl(publicId, { 
        ...baseOptions, 
        format: format as any, 
        width,
        resource_type: 'video'
      }),
      type: `video/${format}`,
      media: width <= 480 
        ? '(max-width: 480px)' 
        : width <= 720 
          ? '(max-width: 720px)' 
          : '(min-width: 721px)'
    }))
  );
}

/**
 * Gets all properties needed for Next.js Image component
 */
export function getNextImageProps(idOrPublicId: string, options: MediaOptions = {}) {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  const publicId = asset ? asset.publicId : idOrPublicId;
  
  const width = options.width || asset?.dimensions?.width || 800;
  const height = options.height || asset?.dimensions?.height || 
    (asset?.dimensions?.aspectRatio ? Math.round(width / asset.dimensions.aspectRatio) : 600);
  
  return {
    src: getMediaUrl(publicId, options),
    width,
    height,
    alt: options.alt || asset?.description || "",
    blurDataURL: getMediaUrl(publicId, {
      width: 10,
      quality: 30,
      format: 'webp'
    }),
    placeholder: "blur",
  };
}

/**
 * Detect media type from ID or URL
 */
export function getMediaType(idOrPublicId: string): 'image' | 'video' {
  const asset = mediaRegistry.getAsset(idOrPublicId);
  if (asset) return asset.type;
  
  // Check extensions and paths
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];
  const hasVideoExtension = videoExtensions.some(ext => 
    idOrPublicId.toLowerCase().endsWith(ext)
  );
  
  const isVideoResource = idOrPublicId.includes('/video/') || 
                          idOrPublicId.includes('resource_type=video');
  
  return (hasVideoExtension || isVideoResource) ? 'video' : 'image';
}
```

## Phase 2: Create Core Media Components

### OptimizedImage Component

```tsx
// components/media/OptimizedImage.tsx
import React from 'react';
import Image, { ImageProps } from 'next/image';
import { getNextImageProps, getMediaUrl } from '@/lib/media/utils';
import { MediaOptions } from '@/lib/media/types';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  id: string;
  options?: MediaOptions;
  fallbackSrc?: string;
  fill?: boolean;
}

export default function OptimizedImage({
  id,
  options = {},
  fallbackSrc,
  fill = false,
  alt = '',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = React.useState(false);
  
  // Get optimized image props
  const imageProps = getNextImageProps(id, {
    ...options,
    alt
  });
  
  // Handle error case
  const handleError = () => {
    if (fallbackSrc) {
      setError(true);
    }
  };
  
  // If we've had an error and have a fallback, use it
  const src = error && fallbackSrc ? fallbackSrc : imageProps.src;
  
  // Render with fill mode if requested
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        onError={handleError}
        blurDataURL={imageProps.blurDataURL}
        placeholder="blur"
        {...props}
      />
    );
  }
  
  // Regular rendering with width and height
  return (
    <Image
      src={src}
      width={imageProps.width}
      height={imageProps.height}
      alt={alt}
      onError={handleError}
      blurDataURL={imageProps.blurDataURL}
      placeholder="blur"
      {...props}
    />
  );
}
```

### OptimizedVideo Component

```tsx
// components/media/OptimizedVideo.tsx
import React, { useRef, useEffect, useState } from 'react';
import { getVideoSources, getMediaUrl } from '@/lib/media/utils';
import Image from 'next/image';
import { VideoOptions } from '@/lib/media/types';

interface OptimizedVideoProps {
  id: string;
  options?: VideoOptions;
  className?: string;
  fallbackImageId?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedVideo({
  id,
  options = {},
  className = '',
  fallbackImageId,
  onLoad,
  onError
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Default options
  const {
    autoPlay = true,
    muted = true,
    loop = true,
    controls = false,
    poster = '',
    format = 'mp4',
    quality = 80,
    width = 1080,
  } = options;
  
  // Get video sources
  const sources = getVideoSources(id, {
    formats: ['mp4', 'webm'],
    widths: [480, 720, 1080],
    baseOptions: options
  });
  
  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Setup video events
  useEffect(() => {
    if (!isMounted) return;
    
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    
    const handleError = () => {
      setHasError(true);
      onError?.();
    };
    
    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('error', handleError);
    
    // Try to play the video
    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay prevented:', error);
        });
      }
    }
    
    return () => {
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('error', handleError);
    };
  }, [isMounted, id, autoPlay, onLoad, onError]);
  
  // Fallback image if video has error or isn't loaded yet
  const showFallback = (!isLoaded || hasError) && fallbackImageId;
  
  // Get poster URL if provided
  const posterUrl = poster ? getMediaUrl(poster, { 
    width: Math.min(width, 1920),
    quality: 80
  }) : undefined;
  
  return (
    <div className="relative overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        poster={posterUrl}
      >
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} media={source.media} />
        ))}
        Your browser does not support the video tag.
      </video>
      
      {/* Fallback/poster image */}
      {showFallback && fallbackImageId && (
        <div className="absolute inset-0 z-10">
          <Image
            src={getMediaUrl(fallbackImageId)}
            alt="Video fallback"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
```

### MediaRenderer Component

```tsx
// components/media/MediaRenderer.tsx
import React from 'react';
import { getMediaType } from '@/lib/media/utils';
import OptimizedImage from './OptimizedImage';
import OptimizedVideo from './OptimizedVideo';
import { MediaOptions, VideoOptions } from '@/lib/media/types';

interface MediaRendererProps {
  id: string;
  alt?: string;
  className?: string;
  imageOptions?: MediaOptions;
  videoOptions?: VideoOptions;
  fill?: boolean;
  fallbackId?: string;
}

export default function MediaRenderer({
  id,
  alt = '',
  className = '',
  imageOptions = {},
  videoOptions = {},
  fill = false,
  fallbackId
}: MediaRendererProps) {
  const mediaType = getMediaType(id);
  
  if (mediaType === 'video') {
    return (
      <OptimizedVideo
        id={id}
        options={videoOptions}
        className={className}
        fallbackImageId={fallbackId}
      />
    );
  }
  
  return (
    <OptimizedImage
      id={id}
      options={{ ...imageOptions, alt }}
      className={className}
      fill={fill}
      fallbackSrc={fallbackId ? `/api/media/proxy?id=${fallbackId}` : undefined}
    />
  );
}
```

## Phase 3: Create Media API and Server Components

### Media API Endpoint

```typescript
// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mediaRegistry from '@/lib/media/registry';
import { getMediaUrl } from '@/lib/media/utils';

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const quality = searchParams.get('quality');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required parameter: id' },
      { status: 400 }
    );
  }
  
  // Get asset from registry
  const asset = mediaRegistry.getAsset(id);
  
  if (!asset) {
    return NextResponse.json(
      { error: 'Media asset not found' },
      { status: 404 }
    );
  }
  
  // Transform options
  const options = {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : undefined,
  };
  
  // Get the URL
  const url = getMediaUrl(asset.publicId, options);
  
  // Return asset with URL
  return NextResponse.json({
    id: asset.id,
    publicId: asset.publicId,
    type: asset.type,
    url,
    dimensions: asset.dimensions,
  });
}
```

### Media Proxy Endpoint

```typescript
// app/api/media/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMediaUrl } from '@/lib/media/utils';
import mediaRegistry from '@/lib/media/registry';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Missing required parameter: id' },
      { status: 400 }
    );
  }
  
  // Get URL from ID
  const asset = mediaRegistry.getAsset(id);
  const url = asset 
    ? getMediaUrl(asset.publicId)
    : getMediaUrl(id);
  
  // Fetch the media
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: response.status }
      );
    }
    
    // Get the response body as array buffer
    const buffer = await response.arrayBuffer();
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the proxied media
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying media:', error);
    return NextResponse.json(
      { error: 'Failed to proxy media' },
      { status: 500 }
    );
  }
}
```

## Phase 4: Implementation Plan for Existing App

### Migration Script

```typescript
// scripts/migrate-media.ts
import fs from 'fs';
import path from 'path';
import glob from 'glob';

function replaceImageTags(content: string): string {
  // Replace Next.js Image tags
  return content.replace(
    /<Image\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
    (match, beforeSrc, src, afterSrc) => {
      // Skip if already using OptimizedImage
      if (match.includes('OptimizedImage')) {
        return match;
      }
      
      // Extract alt, width, height, etc.
      const altMatch = match.match(/alt=["']([^"']*)["']/);
      const widthMatch = match.match(/width=[\{"]([^}"]+)[\}"]/);
      const heightMatch = match.match(/height=[\{"]([^}"]+)[\}"]/);
      const priorityMatch = match.includes('priority');
      const fillMatch = match.includes('fill');
      
      const alt = altMatch ? altMatch[1] : '';
      const width = widthMatch ? widthMatch[1] : '800';
      const height = heightMatch ? heightMatch[1] : '600';
      
      // Determine if using Cloudinary
      const isCloudinary = src.includes('res.cloudinary.com');
      
      // Create new component props
      const idProp = isCloudinary ? 
        `id="${extractAssetIdFromCloudinaryUrl(src)}"` : 
        `id="${src}"`;
      
      const altProp = `alt="${alt}"`;
      const widthProp = !fillMatch && widthMatch ? `width={${width}}` : '';
      const heightProp = !fillMatch && heightMatch ? `height={${height}}` : '';
      const priorityProp = priorityMatch ? 'priority' : '';
      const fillProp = fillMatch ? 'fill' : '';
      
      // Put it all together
      return `<OptimizedImage ${idProp} ${altProp} ${widthProp} ${heightProp} ${priorityProp} ${fillProp} />`;
    }
  );
}

function replaceVideoTags(content: string): string {
  return content.replace(
    /<video\s+([^>]*?)>([\s\S]*?)<\/video>/g,
    (match, attrs, children) => {
      // Skip if already using OptimizedVideo
      if (match.includes('OptimizedVideo')) {
        return match;
      }
      
      // Extract source
      const sourceMatch = children.match(/<source\s+([^>]*?)src=["']([^"']+)["']/);
      if (!sourceMatch) return match;
      
      const src = sourceMatch[2];
      
      // Extract other attributes
      const posterMatch = attrs.match(/poster=["']([^"']+)["']/);
      const poster = posterMatch ? posterMatch[1] : '';
      
      const autoPlayMatch = attrs.includes('autoPlay') || attrs.includes('autoplay');
      const mutedMatch = attrs.includes('muted');
      const loopMatch = attrs.includes('loop');
      const controlsMatch = attrs.includes('controls');
      
      // Create new component props
      const idProp = `id="${extractAssetIdFromCloudinaryUrl(src)}"`;
      const posterProp = poster ? `posterImageId="${extractAssetIdFromCloudinaryUrl(poster)}"` : '';
      const optionProps = `options={{
        autoPlay: ${autoPlayMatch},
        muted: ${mutedMatch},
        loop: ${loopMatch},
        controls: ${controlsMatch}
      }}`;
      
      // Put it all together
      return `<OptimizedVideo ${idProp} ${posterProp} ${optionProps} />`;
    }
  );
}

function extractAssetIdFromCloudinaryUrl(url: string): string {
  // Skip if not a cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  try {
    // Extract the upload/ part and everything after it
    const parts = url.split('upload/');
    if (parts.length < 2) return url;
    
    // If there are transformations, they'll be after the upload/ part
    const transformAndPublicId = parts[1];
    
    // Check if there are transformations (contains a forward slash)
    const hasTransformations = transformAndPublicId.includes('/');
    
    if (hasTransformations) {
      // Get everything after the transformation part
      const publicId = transformAndPublicId.split('/').slice(1).join('/');
      return publicId;
    } else {
      // No transformations, the whole thing is the public ID
      return transformAndPublicId;
    }
  } catch (error) {
    console.error('Error extracting asset ID:', error);
    return url;
  }
}

function addImports(content: string): string {
  // Check if already has imports
  if (content.includes('OptimizedImage') && content.includes('OptimizedVideo')) {
    return content;
  }
  
  // Find the last import
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
  const lastImportIndex = importLines.length ? 
    content.lastIndexOf(importLines[importLines.length - 1]) + importLines[importLines.length - 1].length : 
    0;
  
  const newImports = `
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';
`;
  
  return content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
}

async function processFile(filePath: string): Promise<void> {
  try {
    console.log(`Processing ${filePath}...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    // Add imports
    newContent = addImports(newContent);
    
    // Replace image and video tags
    newContent = replaceImageTags(newContent);
    newContent = replaceVideoTags(newContent);
    
    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️ No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  // Find all React files
  const files = glob.sync('./app/**/*.{tsx,jsx}').concat(
    glob.sync('./components/**/*.{tsx,jsx}')
  );
  
  console.log(`Found ${files.length} files to process`);
  
  // Process each file
  for (const file of files) {
    await processFile(file);
  }
  
  console.log('\nMigration Summary:');
  console.log(`Total files processed: ${files.length}`);
  
  // Suggest manual verification
  console.log('\nNext steps:');
  console.log('1. Run the verification script to check all media assets are accessible');
  console.log('2. Manually review updated files, especially in high-priority sections');
  console.log('3. Test the application to ensure all media loads correctly');
}

// Run the migration
main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});