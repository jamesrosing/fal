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
  console.log(`Original image path: ${id}`);
  
  // Handle special case for general/general pattern (fix for 404 errors)
  if (id.startsWith('general/general/')) {
    // Convert general/general/placeholder-XXX to home/placeholders/XXX
    const name = id.replace('general/general/placeholder-', '');
    const newPath = `home/placeholders/${name.toLowerCase().replace(/\s+/g, '-')}`;
    console.log(`Mapped general/general path: ${id} to ${newPath}`);
    return newPath;
  }
  
  // Handle special case for hero/hero-articles pattern (fix for 404 errors)
  if (id === 'hero/hero-articles') {
    console.log(`Mapped hero/hero-articles to home/hero/articles`);
    return 'home/hero/articles';
  }
  
  // Handle other hero/hero-* patterns
  if (id === 'hero/hero-poster') {
    console.log(`Mapped hero/hero-poster to home/hero/poster`);
    return 'home/hero/poster';
  }
  
  if (id === 'hero/hero-fallback') {
    console.log(`Mapped hero/hero-fallback to home/hero/fallback`);
    return 'home/hero/fallback';
  }
  
  // Map fal/ paths to home/ for Cloudinary compatibility
  if (id.startsWith('fal/pages/')) {
    // Convert fal/pages/services/plastic-surgery/body/liposuction to home/services/plastic-surgery/body/liposuction
    const newPath = id.replace('fal/pages/', 'home/');
    console.log(`Mapped to: ${newPath}`);
    return newPath;
  }
  
  // Handle other fal/ paths
  if (id.startsWith('fal/')) {
    // Convert fal/components/ or fal/videos/ etc. to home/...
    const newPath = id.replace('fal/', 'home/');
    console.log(`Mapped to: ${newPath}`);
    return newPath;
  }
  
  // Handle different ID formats
  if (id.startsWith('page:')) {
    // Convert page:services/hero.jpg to home/services/hero
    const path = id.replace('page:', '').replace(/\.[^/.]+$/, ''); // Remove file extension
    const newPath = `home/${path}`;
    console.log(`Mapped page: ${id} to ${newPath}`);
    return newPath;
  }
  
  if (id.startsWith('component:')) {
    // Convert component:Hero/assets/background.jpg to home/components/Hero/assets/background
    const path = id.replace('component:', '').replace(/\.[^/.]+$/, '');
    const newPath = `home/components/${path}`;
    console.log(`Mapped component: ${id} to ${newPath}`);
    return newPath;
  }
  
  // If it's an absolute path without prefix, add home/ prefix
  if (id.match(/^(pages|services|components)/)) {
    const newPath = `home/${id}`;
    console.log(`Mapped path: ${id} to ${newPath}`);
    return newPath;
  }
  
  // If it's already a path that starts with home/, use as is
  if (id.startsWith('home/')) {
    return id;
  }
  
  // Handle special case for homepage-mission-section video
  if (id === 'homepage-mission-section' || id.includes('homepage-mission-section.mp4')) {
    console.log(`Mapped homepage-mission-section to home/videos/homepage-mission-section`);
    return 'home/videos/homepage-mission-section';
  }
  
  // Handle special case for services-medical-spa path pattern
  if (id.startsWith('services-medical-spa/')) {
    const newPath = `home/services/medical-spa/${id.replace('services-medical-spa/', '')}`;
    console.log(`Mapped services-medical-spa path: ${id} to ${newPath}`);
    return newPath;
  }
  
  // Handle special case for services-dermatology path pattern
  if (id.startsWith('services-dermatology/')) {
    const newPath = `home/services/dermatology/${id.replace('services-dermatology/', '')}`;
    console.log(`Mapped services-dermatology path: ${id} to ${newPath}`);
    return newPath;
  }
  
  // Handle special case for services-plastic-surgery path pattern
  if (id.startsWith('services-plastic-surgery/')) {
    const newPath = `home/services/plastic-surgery/${id.replace('services-plastic-surgery/', '')}`;
    console.log(`Mapped services-plastic-surgery path: ${id} to ${newPath}`);
    return newPath;
  }
  
  // Default case - assume direct Cloudinary path
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