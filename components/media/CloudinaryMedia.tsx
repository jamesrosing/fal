"use client";

import React from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

// Define prop types for our components
interface CloudinaryImageProps {
  id: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  options?: Record<string, any>;
  [key: string]: any;
}

interface CloudinaryVideoProps {
  id: string;
  width?: number;
  height?: number;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  fill?: boolean;
  poster?: string;
  options?: Record<string, any>;
}

// Convert our current ID format to Cloudinary path
function getCloudinaryPath(id: string): string {
  // Map fal/ paths to home/ for Cloudinary compatibility
  if (id.startsWith('fal/')) {
    console.log(`Mapping Cloudinary path from ${id} to ${id.replace('fal/', 'home/')}`);
    return id.replace('fal/', 'home/');
  }
  
  // Handle different ID formats
  if (id.startsWith('page:')) {
    // Convert page:services/hero.jpg to home/pages/services/hero
    const path = id.replace('page:', '').replace(/\.[^/.]+$/, ''); // Remove file extension
    return `home/pages/${path}`;
  }
  
  if (id.startsWith('component:')) {
    // Convert component:Hero/assets/background.jpg to home/components/Hero/assets/background
    const path = id.replace('component:', '').replace(/\.[^/.]+$/, '');
    return `home/components/${path}`;
  }
  
  // If it's an absolute path without prefix, add home/ prefix
  if (id.match(/^(pages|services|components)/)) {
    return `home/${id}`;
  }
  
  // If it's already a Cloudinary path, use as is
  return id;
}

// CloudinaryImage component
export function CloudinaryImage({ 
  id, 
  alt = "",
  fill = false,
  className = "",
  width = 800,
  height = 600,
  priority = false,
  sizes,
  quality = 90,
  options = {},
  ...props 
}: CloudinaryImageProps) {
  // Convert the ID to a Cloudinary path
  const src = getCloudinaryPath(id);
  
  // Check if path starts with http - means it's an external URL, not Cloudinary
  if (id.startsWith('http')) {
    if (fill) {
      return (
        <div className={`relative w-full h-full ${className}`}>
          <Image
            src={id}
            alt={alt}
            fill
            className={`object-cover w-full h-full ${className}`}
            {...props}
          />
        </div>
      );
    }
    
    return (
      <Image
        src={id}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  }
  
  // Check if this is a local file (page: or component:)
  if (id.startsWith('page:') || id.startsWith('component:')) {
    console.log(`${id} is a local file, using Image component`);
    // For local files, handle the file path directly and use Next.js Image
    const localPath = id.startsWith('page:') 
      ? `/images/pages/${id.replace('page:', '')}`
      : `/components/${id.replace('component:', '')}`;
    
    if (fill) {
      return (
        <div className={`relative w-full h-full ${className}`}>
          <Image
            src={localPath}
            alt={alt}
            fill
            className={`object-cover w-full h-full ${className}`}
            priority={priority}
            sizes={sizes}
            {...props}
          />
        </div>
      );
    }
    
    return (
      <Image
        src={localPath}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={sizes}
        {...props}
      />
    );
  }
  
  // Use Cloudinary Image for cloudinary assets
  console.log(`Using Cloudinary image: ${src} (original ID: ${id})`);
  
  // Use Cloudinary Image with fill mode if requested
  if (fill) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        crop="fill"
        sizes={sizes || "100vw"}
        className={`object-cover w-full h-full ${className}`}
        priority={priority}
        {...options}
        {...props}
      />
    );
  }
  
  // Standard rendering
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      {...options}
      {...props}
    />
  );
}

// CloudinaryVideo component
export function CloudinaryVideo({ 
  id, 
  width = 800,
  height = 450,
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  fill = false,
  poster,
  options = {}
}: CloudinaryVideoProps) {
  // Convert the ID to a Cloudinary path
  const src = getCloudinaryPath(id);
  
  // For now, use a basic video tag 
  const posterUrl = poster ? 
    (poster.startsWith('http') ? poster : `https://res.cloudinary.com/dyrzyfg3w/image/upload/${getCloudinaryPath(poster)}`) : 
    undefined;
  
  if (fill) {
    return (
      <div className="relative w-full h-full">
        <video
          src={`https://res.cloudinary.com/dyrzyfg3w/video/upload/${src}`}
          className={`w-full h-full object-cover ${className}`}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          poster={posterUrl}
          playsInline
        />
      </div>
    );
  }
  
  return (
    <video
      src={`https://res.cloudinary.com/dyrzyfg3w/video/upload/${src}`}
      width={width}
      height={height}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      poster={posterUrl}
      playsInline
    />
  );
}

// Media renderer that detects the type of media
export function CloudinaryMedia({
  id,
  type,
  ...props
}: { id: string; type?: 'image' | 'video' } & Record<string, any>) {
  // Auto-detect type if not provided
  const detectedType = type || (
    id.match(/\.(mp4|webm|mov|avi)$/i) ? 'video' : 'image'
  );
  
  if (detectedType === 'video') {
    return <CloudinaryVideo id={id} {...props} />;
  }
  
  return <CloudinaryImage id={id} {...props} />;
}

export default {
  CloudinaryImage,
  CloudinaryVideo,
  CloudinaryMedia
}; 