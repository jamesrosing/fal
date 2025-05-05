'use client';

import React, { useState, useEffect } from 'react';
import CldImage from './CldImage';
import { Skeleton } from "@/components/ui/skeleton";

// Constants for Cloudinary folder structure
const CLOUDINARY_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'alluremd';

interface FolderImageProps {
  folder: string;
  imageName?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number | string;
  crop?: 'fill' | 'scale' | 'fit' | 'pad' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  fallback?: string;
}

/**
 * CloudinaryFolderImage - Easily render images from Cloudinary folders
 * 
 * @example
 * // Render an image from the services/dermatology folder
 * <CloudinaryFolderImage
 *   folder="services/dermatology"
 *   imageName="acne-treatment"
 *   alt="Acne Treatment"
 *   width={800}
 *   height={600}
 * />
 * 
 * // Render an image with just the folder path (useful for consistent naming)
 * <CloudinaryFolderImage
 *   folder="pages/home/hero"
 *   alt="Home Hero"
 *   width={1920}
 *   height={1080}
 *   priority
 * />
 */
export default function CloudinaryFolderImage({
  folder,
  imageName,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className = '',
  sizes = '100vw',
  quality = 'auto',
  crop = 'fill',
  gravity = 'auto',
  fallback = '/images/global/placeholder-image.jpg'
}: FolderImageProps) {
  // Format the public ID correctly (with folder path)
  const publicId = imageName
    ? `${CLOUDINARY_FOLDER}/${folder}/${imageName}`
    : `${CLOUDINARY_FOLDER}/${folder}`;
  
  // Log the public ID for debugging
  useEffect(() => {
    console.log(`Rendering Cloudinary image: ${publicId}`);
  }, [publicId]);
  
  return (
    <CldImage
      publicId={publicId}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      crop={crop}
      gravity={gravity}
      quality={quality}
      priority={priority}
      fallbackSrc={fallback}
      showLoading={true}
    />
  );
} 