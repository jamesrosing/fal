import { IMAGE_ASSETS } from '../image-config.js';

// Define placements for different media areas
export const MEDIA_PLACEMENTS = {
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
  constructor() {
    this.assets = new Map();
    this.fallbacks = {
      image: {
        default: '/images/placeholder.jpg',
        hero: '/images/placeholder-hero.jpg',
        article: '/images/placeholder-article.jpg',
        team: '/images/placeholder-team.jpg',
        logo: '/images/placeholder-logo.png'
      },
      video: {
        default: '/videos/placeholder.mp4',
        hero: '/videos/placeholder-hero.mp4'
      }
    };
  }
  
  registerAsset(asset) {
    this.assets.set(asset.id, asset);
  }
  
  registerBulk(assets) {
    assets.forEach(asset => this.registerAsset(asset));
  }
  
  getAsset(id) {
    // Check if it's a direct asset ID
    const asset = this.assets.get(id);
    if (asset) return asset;
    
    // Check if it's a key in the IMAGE_ASSETS object
    if (IMAGE_ASSETS[id]) {
      this.registerAsset(IMAGE_ASSETS[id]);
      return IMAGE_ASSETS[id];
    }
    
    // Try to find assets that might match by normalizing the ID
    const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Look for a matching asset in the registry
    for (const [key, asset] of this.assets.entries()) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (normalizedKey === normalizedId) {
        return asset;
      }
    }
    
    // Look for a matching asset in IMAGE_ASSETS
    for (const [key, asset] of Object.entries(IMAGE_ASSETS)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (normalizedKey === normalizedId) {
        this.registerAsset(asset);
        return asset;
      }
    }
    
    // Log the missing asset for debugging
    console.warn(`Asset ID not found: ${id}`);
    return null;
  }
  
  getAllAssets() {
    return Array.from(this.assets.values());
  }
  
  getAssetsByArea(area) {
    return this.getAllAssets().filter(asset => asset.area === area);
  }
  
  updateAsset(id, updates) {
    const asset = this.getAsset(id);
    if (asset) {
      this.assets.set(id, { ...asset, ...updates });
    }
  }
  
  getFallbackForAsset(id) {
    // Try to get the asset
    const asset = this.getAsset(id);
    
    // If we have an asset, return the fallback for its area or type
    if (asset) {
      const { type, area } = asset;
      return this.fallbacks[type]?.[area] || this.fallbacks[type]?.default || this.fallbacks.image.default;
    }
    
    // Default fallback
    return this.fallbacks.image.default;
  }
}

// Create singleton instance
export const mediaRegistry = new MediaRegistry();

// Pre-register all assets from IMAGE_ASSETS
Object.values(IMAGE_ASSETS).forEach(asset => {
  mediaRegistry.registerAsset(asset);
});

// Add some fallback test assets
mediaRegistry.registerAsset({
  id: 'test-image',
  type: 'image',
  area: 'hero',
  description: 'Test image',
  publicId: 'hero/test-image',
  dimensions: {
    width: 1920,
    height: 1080,
    aspectRatio: 16/9
  },
  defaultOptions: {
    width: 1920,
    quality: 90,
    format: 'auto'
  }
});

export default mediaRegistry;