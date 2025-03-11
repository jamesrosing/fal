"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MediaImageProps {
  // Either provide placeholderId OR publicId
  placeholderId?: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  // Cloudinary transformations
  transformations?: {
    crop?: 'fill' | 'scale' | 'crop' | 'thumb';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
}

export function MediaImage({
  placeholderId,
  publicId,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  quality = 80,
  transformations = {}
}: MediaImageProps) {
  const [cloudinaryId, setCloudinaryId] = useState<string | null>(publicId || null);
  const [loading, setLoading] = useState(!!placeholderId && !publicId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a publicId directly, we don't need to fetch from API
    if (publicId) {
      setCloudinaryId(publicId);
      setLoading(false);
      return;
    }
    
    if (placeholderId) {
      fetchCloudinaryId();
    }
  }, [placeholderId, publicId]);

  async function fetchCloudinaryId() {
    try {
      const response = await fetch(`/api/media?placeholderId=${encodeURIComponent(placeholderId!)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.publicId) {
        setCloudinaryId(data.publicId);
      } else {
        setError('Media not found');
      }
    } catch (err: any) {
      console.error('Error fetching media:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Build Cloudinary URL with transformations
  const getCloudinaryUrl = (publicId: string): string => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return '';
    
    const { crop = 'fill', gravity = 'auto', format = 'auto' } = transformations;
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_${crop},g_${gravity},f_${format},q_${quality}/${publicId}`;
  };

  if (loading) {
    // Return empty div or skeleton during loading
    return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width: width || '100%', height: height || '100%' }}></div>;
  }

  if (error || !cloudinaryId) {
    // Return fallback image if there's an error or no ID
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ width: width || '100%', height: height || '100%' }}>
        <span className="text-sm text-gray-400">{error || 'Image not found'}</span>
      </div>
    );
  }

  // Use Next.js Image component with proper Cloudinary URL
  const imageUrl = getCloudinaryUrl(cloudinaryId);

  // Return the appropriate Image component based on whether fill is used
  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        className={className}
        fill
        priority={priority}
      />
    );
  }

  // Regular Image with width and height
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
    />
  );
} 