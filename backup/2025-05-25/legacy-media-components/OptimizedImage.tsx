"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getMediaUrl } from '@/lib/media/utils';
import { MediaOptions } from '@/lib/media/types';
import mediaRegistry from '../../lib/image-config';
import { getCloudinaryUrl } from '@/lib/cloudinary';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  id: string;
  options?: MediaOptions;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
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
  onError,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Check if id is directly a Cloudinary path
  const isDirectCloudinaryId = id && typeof id === 'string' && (
    id.startsWith('logos/') || 
    id.startsWith('global/logos/') ||
    id.startsWith('hero/') || 
    id.startsWith('articles/') ||
    id.includes('allure_md') ||
    id.includes('avatar')
  );
  
  // Get cloudName from environment variable
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  
  // Construct a direct Cloudinary URL for known path patterns
  const directCloudinaryUrl = isDirectCloudinaryId 
    ? getCloudinaryUrl(id, {
        width: options.width || 800,
        quality: options.quality || 'auto',
        format: options.format || 'auto'
      })
    : null;
  
  // Try to get asset from registry or use direct path if it's a known pattern
  const asset = typeof id === 'string' ? mediaRegistry[id] : null;
  const defaultFallback = asset?.area ? `/images/placeholder-${asset.area}.jpg` : '/images/placeholder.jpg';
  const effectiveFallback = fallbackSrc || defaultFallback;
  
  // Default blur data URL for placeholder images
  const defaultBlurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJCLNE5QQAAAABJRU5ErkJggg==';
  
  useEffect(() => {
    // Reset state when ID changes
    setError(false);
    setLoading(true);
    
    // Gather debug info if enabled
    if (showDebugInfo) {
      setDebugInfo({
        id,
        assetFound: !!asset,
        publicId: asset?.publicId || (isDirectCloudinaryId ? id : 'unknown'),
        area: asset?.area || 'unknown',
        type: (asset as any)?.type || 'unknown',
        directCloudinaryUrl: directCloudinaryUrl
      });
    }
  }, [id, asset, showDebugInfo, isDirectCloudinaryId, directCloudinaryUrl]);
  
  // Determine the image source
  const imageSrc = React.useMemo(() => {
    if (directCloudinaryUrl) {
      return directCloudinaryUrl;
    } else if (typeof id === 'string' && mediaRegistry[id]) {
      // Fetch from image registry
      const asset = mediaRegistry[id];
      return getMediaUrl(asset.publicId, {
        width: options.width || asset.dimensions?.width || 800,
        quality: options.quality || asset.defaultOptions.quality,
        format: asset.defaultOptions.format
      });
    } else if (typeof id === 'string' && (id.startsWith('http://') || id.startsWith('https://'))) {
      // Direct URL provided
      return id;
    } else if (typeof id === 'object') {
      // StaticImageData object
      return id;
    } else {
      // Fallback to placeholder
      return effectiveFallback;
    }
  }, [id, options.width, options.quality, directCloudinaryUrl, effectiveFallback]);
  
  // Handle error case
  const handleError = () => {
    console.warn(`Image load error for ID: ${id}`);
    setError(true);
    setLoading(false);
    if (onError) {
      onError();
    }
  };
  
  // Handle load success
  const handleLoad = () => {
    setLoading(false);
    if (onLoad) {
      onLoad();
    }
  };
  
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
        {directCloudinaryUrl && <div>Direct: {directCloudinaryUrl.substring(0, 30)}...</div>}
      </div>
    );
  };
  
  // Render with fill mode if requested
  if (fill) {
    return (
      <div style={{ position: 'relative' }}>
        <Image
          src={imageSrc}
          alt={alt}
          fill
          onError={handleError}
          onLoad={handleLoad}
          blurDataURL={options.blurDataURL || defaultBlurDataURL}
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
        src={imageSrc}
        width={options.width || asset?.dimensions?.width || 800}
        height={options.height || asset?.dimensions?.height || 600}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        blurDataURL={options.blurDataURL || defaultBlurDataURL}
        placeholder="blur"
        {...props}
      />
      {renderDebugInfo()}
    </div>
  );
}