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
  blurDataURL?: string;
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