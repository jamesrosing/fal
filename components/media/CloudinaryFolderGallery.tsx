'use client';

import React from 'react';
import CloudinaryFolderImage from './CloudinaryFolderImage';

interface ImageItem {
  folder: string;
  imageName?: string;
  alt: string;
}

interface CloudinaryFolderGalleryProps {
  images: ImageItem[];
  columns?: number;
  gap?: number;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  imageClassName?: string;
}

/**
 * CloudinaryFolderGallery - Display multiple images from Cloudinary folders in a responsive grid
 * 
 * @example
 * <CloudinaryFolderGallery
 *   images={[
 *     { folder: 'gallery/emsculpt/abdomen', alt: 'Emsculpt Abdomen Before & After' },
 *     { folder: 'gallery/emsculpt/arms', alt: 'Emsculpt Arms Before & After' },
 *     { folder: 'services/medical-spa/emsculpt', imageName: 'machine', alt: 'Emsculpt Machine' }
 *   ]}
 *   columns={3}
 *   gap={16}
 * />
 */
export default function CloudinaryFolderGallery({
  images,
  columns = 3,
  gap = 16,
  imageWidth = 400,
  imageHeight = 300,
  className = '',
  imageClassName = ''
}: CloudinaryFolderGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div 
      className={`grid ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {images.map((image, index) => (
        <div key={`${image.folder}-${image.imageName ?? index}`} className="relative">
          <CloudinaryFolderImage
            folder={image.folder}
            imageName={image.imageName}
            alt={image.alt}
            width={imageWidth}
            height={imageHeight}
            className={`w-full h-auto object-cover rounded ${imageClassName}`}
            crop="fill"
          />
        </div>
      ))}
    </div>
  );
} 