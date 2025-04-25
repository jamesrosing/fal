"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getNextImageProps, getMediaUrl } from '@/lib/media/utils';
import { MediaOptions } from '@/lib/media/types';
import mediaRegistry from '../../lib/image-config';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  id: string;
  options?: MediaOptions;
  fallbackSrc?: string;
  fill?: boolean;
  showDebugInfo?: boolean;
}

export default function OptimizedImage({
  id,
  options = {},
  fallbackSrc = '/images/placeholder.jpg',
  fill = false,
  alt = '',
  showDebugInfo = false,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const asset = typeof id === 'string' ? mediaRegistry[id] : null;
  const defaultFallback = asset?.area ? `/images/placeholder-${asset.area}.jpg` : '/images/placeholder.jpg';
  const effectiveFallback = fallbackSrc || defaultFallback;
  
  useEffect(() => {
    // Reset state when ID changes
    setError(false);
    setLoading(true);
    
    // Gather debug info if enabled
    if (showDebugInfo) {
      setDebugInfo({
        id,
        assetFound: !!asset,
        publicId: asset?.publicId || 'unknown',
        area: asset?.area || 'unknown',
        type: (asset as any)?.type || 'unknown'
      });
    }
  }, [id, asset, showDebugInfo]);
  
  // Get optimized image props - this may throw if the ID is not found
  let imageProps;
  try {
    imageProps = getNextImageProps(id, {
      ...options,
      alt
    });
  } catch (err) {
    console.error(`Error loading image props for ID: ${id}`, err);
    // Use fallback immediately if getNextImageProps fails
    imageProps = {
      src: effectiveFallback,
      width: options.width || asset?.dimensions?.width || 800,
      height: options.height || asset?.dimensions?.height || 600,
      alt: alt || asset?.description || 'Image not found',
      blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg==',
      placeholder: 'blur' as 'blur',
    };
  }
  
  // Handle error case
  const handleError = () => {
    console.warn(`Image load error for ID: ${id}`);
    setError(true);
    setLoading(false);
  };
  
  // Handle load success
  const handleLoad = () => {
    setLoading(false);
  };
  
  // Choose the right source - try from props first, then fallback if error
  const src = error ? effectiveFallback : imageProps.src;
  
  // Render debug info if enabled
  const renderDebugInfo = () => {
    if (!showDebugInfo || !debugInfo) return null;
    
    return (
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px',
          fontSize: '10px',
          zIndex: 100
        }}
      >
        <div>ID: {debugInfo.id}</div>
        <div>Found: {debugInfo.assetFound ? 'Yes' : 'No'}</div>
        <div>PublicID: {debugInfo.publicId}</div>
        <div>Area: {debugInfo.area}</div>
        <div>Type: {debugInfo.type}</div>
        <div>Status: {error ? 'Error' : loading ? 'Loading' : 'Loaded'}</div>
      </div>
    );
  };
  
  // Render with fill mode if requested
  if (fill) {
    return (
      <div style={{ position: 'relative' }}>
        <Image
          src={src}
          alt={alt}
          fill
          onError={handleError}
          onLoad={handleLoad}
          blurDataURL={imageProps.blurDataURL}
          placeholder="blur"
          {...props}
        />
        {renderDebugInfo()}
      </div>
    );
  }
  
  // Regular rendering with width and height
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Image
        src={src}
        width={imageProps.width}
        height={imageProps.height}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        blurDataURL={imageProps.blurDataURL}
        placeholder="blur"
        {...props}
      />
      {renderDebugInfo()}
    </div>
  );
}