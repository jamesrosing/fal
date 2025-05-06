import { MediaAsset, MediaArea, MediaPlacement, MediaType, ImageFormat, VideoFormat } from './types';
import { IMAGE_ASSETS } from '../image-config';

// Define placements for different media areas
export const MEDIA_PLACEMENTS: Record<MediaArea, MediaPlacement> = {
  hero: {
    path: "hero",
    description: "Main hero images for section headers",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  article: {
    path: "articles",
    description: "Article header images",
    dimensions: {
      width: 1200,
      height: 675,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  service: {
    path: "services",
    description: "Service category images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  team: {
    path: "team/headshots",
    description: "Team member headshots",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    transformations: ["c_fill", "g_face", "f_auto", "q_auto"]
  },
  gallery: {
    path: "gallery",
    description: "Gallery images",
    dimensions: {
      width: 800,
      height: 600,
      aspectRatio: 4/3
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  },
  logo: {
    path: "branding",
    description: "Logo and branding assets",
    dimensions: {
      width: 200,
      height: 0,
      aspectRatio: 0
    },
    transformations: ["c_scale", "f_auto", "q_auto"]
  },
  "video-thumbnail": {
    path: "videos/thumbnails",
    description: "Thumbnails for videos",
    dimensions: {
      width: 1280,
      height: 720,
      aspectRatio: 16/9
    },
    transformations: ["c_fill", "g_auto", "f_auto", "q_auto"]
  }
};

// Simple in-memory registry for placeholder IDs to media assets
// This will be replaced with a database-backed solution in the future
export const mediaRegistry: Record<string, MediaAsset> = {
  // Hero section placeholders
  "hero-poster": {
    id: "hero-poster",
    publicId: "hero/hero-poster",
    type: "image",
    description: "Hero section poster image",
    area: "hero",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1920,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  "hero-fallback": {
    id: "hero-fallback",
    publicId: "hero/hero-fallback",
    type: "image",
    description: "Hero section fallback image",
    area: "hero",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1920,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  "hero-video-mp4": {
    id: "hero-video-mp4",
    publicId: "emsculpt/videos/hero/hero-720p-mp4",
    type: "video",
    description: "Hero section MP4 video",
    area: "hero",
    dimensions: {
      width: 1280,
      height: 720,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1280,
      quality: 90
    }
  },
  "hero-video-webm": {
    id: "hero-video-webm",
    publicId: "emsculpt/videos/hero/hero-720p-webm",
    type: "video",
    description: "Hero section WebM video",
    area: "hero",
    dimensions: {
      width: 1280,
      height: 720,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1280,
      quality: 90
    }
  },
  "hero-video-mobile": {
    id: "hero-video-mobile",
    publicId: "emsculpt/videos/hero/hero-480p-mp4",
    type: "video",
    description: "Hero section mobile MP4 video",
    area: "hero",
    dimensions: {
      width: 854,
      height: 480,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 854,
      quality: 90
    }
  },
  
  // About section placeholders
  "homepage-about-background": {
    id: "homepage-about-background",
    publicId: "homepage/about-background",
    type: "image",
    description: "About section background image",
    area: "hero" as MediaArea,
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1920,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  
  // Team section placeholders
  "homepage-team-background": {
    id: "homepage-team-background",
    publicId: "homepage/team-background",
    type: "image",
    description: "Team section background image",
    area: "team",
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 16/9
    },
    defaultOptions: {
      width: 1920,
      quality: 80,
      format: "auto" as ImageFormat
    }
  },
  "team-provider-rosing": {
    id: "team-provider-rosing",
    publicId: "team/provider-rosing",
    type: "image",
    description: "Dr. James Rosing profile image",
    area: "team",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    defaultOptions: {
      width: 600,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  "team-provider-pearose": {
    id: "team-provider-pearose",
    publicId: "team/provider-pearose",
    type: "image",
    description: "Susan Pearose profile image",
    area: "team",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    defaultOptions: {
      width: 600,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  "team-provider-julia": {
    id: "team-provider-julia",
    publicId: "team/provider-julia",
    type: "image",
    description: "Julia profile image",
    area: "team",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    defaultOptions: {
      width: 600,
      quality: 90,
      format: "auto" as ImageFormat
    }
  },
  "team-provider-gidwani": {
    id: "team-provider-gidwani",
    publicId: "team/provider-gidwani",
    type: "image",
    description: "Dr. Pooja Gidwani profile image",
    area: "team",
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 3/4
    },
    defaultOptions: {
      width: 600,
      quality: 90,
      format: "auto" as ImageFormat
    }
  }
};

// Helper function to register a new media asset
export function registerMediaAsset(asset: MediaAsset) {
  mediaRegistry[asset.id] = asset;
}

// Helper function to get a media asset by its placeholder ID
export function getMediaAsset(placeholderId: string): MediaAsset | null {
  return mediaRegistry[placeholderId] || null;
}

// Helper function to update a media asset
export function updateMediaAsset(assetId: string, publicId: string, type?: MediaType) {
  if (mediaRegistry[assetId]) {
    mediaRegistry[assetId].publicId = publicId;
    if (type) {
      mediaRegistry[assetId].type = type;
    }
  }
}

// Create a centralized media registry
class MediaRegistry {
  private assets: Map<string, MediaAsset> = new Map();
  
  registerAsset(asset: MediaAsset): void {
    this.assets.set(asset.id, asset);
  }
  
  registerBulk(assets: MediaAsset[]): void {
    assets.forEach(asset => this.registerAsset(asset));
  }
  
  getAsset(id: string): MediaAsset | undefined {
    return this.assets.get(id);
  }
  
  getAllAssets(): MediaAsset[] {
    return Array.from(this.assets.values());
  }
  
  getAssetsByArea(area: MediaArea): MediaAsset[] {
    return this.getAllAssets().filter(asset => asset.area === area);
  }
  
  updateAsset(id: string, updates: Partial<MediaAsset>): void {
    const asset = this.getAsset(id);
    if (asset) {
      this.assets.set(id, { ...asset, ...updates });
    }
  }
}

// Create singleton instance
export const mediaRegistryInstance = new MediaRegistry();

// Pre-register all known assets
// Register assets from image-config.ts
Object.values(IMAGE_ASSETS).forEach(asset => {
  mediaRegistryInstance.registerAsset({
    ...asset,
    type: 'image',
  });
});

export default mediaRegistryInstance; 