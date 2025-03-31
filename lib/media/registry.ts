import { MediaAsset, MediaArea, MediaPlacement } from './types';
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
export const mediaRegistry = new MediaRegistry();

// Pre-register all known assets
// Register assets from image-config.ts
Object.values(IMAGE_ASSETS).forEach(asset => {
  mediaRegistry.registerAsset({
    ...asset,
    type: 'image',
  });
});

export default mediaRegistry; 