"use client";

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

export function MediaRenderer({
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
      alt={alt}
      options={{ ...imageOptions, alt }}
      className={className}
      fill={fill}
      fallbackSrc={fallbackId ? `/api/media/proxy?id=${fallbackId}` : undefined}
    />
  );
}

export default MediaRenderer; 