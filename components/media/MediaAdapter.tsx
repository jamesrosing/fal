"use client";

import React from 'react';
import UnifiedMedia from './UnifiedMedia';
import { ImageProps } from 'next/image';

// Define the props types directly here since we're providing compatibility
// with components that might not be available or are being replaced

type CloudinaryImageProps = {
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: any;
};

type MediaImageProps = {
  assetId: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  [key: string]: any;
};

type UnifiedImageProps = {
  src?: string;
  alt?: string;
  placeholderId?: string;
  width?: number;
  height?: number;
  [key: string]: any;
};

// This adapter component provides backward compatibility with existing components
// It can handle props from CloudinaryImage, MediaImage, or UnifiedImage components

type MediaAdapterProps = 
  | (CloudinaryImageProps & { componentType: 'CloudinaryImage' })
  | (MediaImageProps & { componentType: 'MediaImage' })
  | (UnifiedImageProps & { componentType: 'UnifiedImage' });

const MediaAdapter: React.FC<MediaAdapterProps> = (props) => {
  const { componentType, ...restProps } = props;

  // Handle CloudinaryImage props
  if (componentType === 'CloudinaryImage') {
    const { publicId, alt, width, height, ...otherProps } = restProps as CloudinaryImageProps;
    return (
      <UnifiedMedia
        src={publicId} 
        alt={alt || 'Image'}
        width={width}
        height={height}
        {...otherProps}
      />
    );
  }

  // Handle MediaImage props
  if (componentType === 'MediaImage') {
    const { 
      assetId, 
      alt, 
      className,
      width, 
      height,
      priority,
      ...otherProps 
    } = restProps as MediaImageProps;
    
    return (
      <UnifiedMedia
        placeholderId={assetId}
        alt={alt || 'Image'}
        className={className}
        width={width}
        height={height}
        priority={priority}
        {...otherProps}
      />
    );
  }

  // Handle UnifiedImage props
  if (componentType === 'UnifiedImage') {
    const { 
      src, 
      alt, 
      placeholderId,
      width, 
      height,
      ...otherProps 
    } = restProps as UnifiedImageProps;
    
    // If placeholderId is provided, use that
    if (placeholderId) {
      return (
        <UnifiedMedia
          placeholderId={placeholderId}
          alt={alt || 'Image'}
          width={width}
          height={height}
          {...otherProps}
        />
      );
    }
    
    // Otherwise use src directly
    return (
      <UnifiedMedia
        src={src}
        alt={alt || 'Image'}
        width={width}
        height={height}
        {...otherProps}
      />
    );
  }

  // This should never happen if the componentType is correctly specified
  console.error('Invalid componentType provided to MediaAdapter:', componentType);
  return null;
};

export default MediaAdapter; 