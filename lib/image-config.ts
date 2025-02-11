import { getCloudinaryUrl } from './cloudinary';

// Define the ImageAsset type
export interface ImageAsset {
  id: string;
  area: 'hero' | 'gallery' | 'service' | 'team' | 'logo';
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
  };
}

// Central configuration for all image assets
export const IMAGE_ASSETS: Record<string, ImageAsset> = {
  ['hero-home']: {
    id: 'hero-home',
    area: 'hero',
    description: 'Main Homepage Hero Image',
    publicId: 'hero/home-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-about']: {
    id: 'hero-about',
    area: 'hero',
    description: 'About Page Hero Image',
    publicId: 'hero/about-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-team']: {
    id: 'hero-team',
    area: 'hero',
    description: 'Team Page Hero Image',
    publicId: 'hero/hero-team',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-gallery']: {
    id: 'hero-gallery',
    area: 'hero',
    description: 'Gallery Page Hero Image',
    publicId: 'hero/gallery-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-financing']: {
    id: 'hero-financing',
    area: 'hero',
    description: 'Financing Page Hero Image',
    publicId: 'hero/financing-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-reviews']: {
    id: 'hero-reviews',
    area: 'hero',
    description: 'Reviews Page Hero Image',
    publicId: 'hero/reviews-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-appointment']: {
    id: 'hero-appointment',
    area: 'hero',
    description: 'Appointment Page Hero Image',
    publicId: 'hero/appointment-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-out-of-town']: {
    id: 'hero-out-of-town',
    area: 'hero',
    description: 'Out of Town Patients Hero Image',
    publicId: 'hero/1441-1401-avocado-avenue',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-plastic-surgery']: {
    id: 'hero-plastic-surgery',
    area: 'hero',
    description: 'Plastic Surgery Service Hero Image',
    publicId: 'hero/plastic-surgery-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-dermatology']: {
    id: 'hero-dermatology',
    area: 'hero',
    description: 'Dermatology Service Hero Image',
    publicId: 'hero/dermatology-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-medical-spa']: {
    id: 'hero-medical-spa',
    area: 'hero',
    description: 'Medical Spa Service Hero Image',
    publicId: 'hero/medical-spa-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-functional-medicine']: {
    id: 'hero-functional-medicine',
    area: 'hero',
    description: 'Functional Medicine Service Hero Image',
    publicId: 'hero/functional-medicine-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-injectables']: {
    id: 'hero-injectables',
    area: 'hero',
    description: 'Injectables Page Hero Image',
    publicId: 'hero/injectables-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-facial-treatments']: {
    id: 'hero-facial-treatments',
    area: 'hero',
    description: 'Facial Treatments Page Hero Image',
    publicId: 'hero/facial-treatments-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  ['hero-skin-rejuvenation']: {
    id: 'hero-skin-rejuvenation',
    area: 'hero',
    description: 'Skin Rejuvenation Page Hero Image',
    publicId: 'hero/skin-rejuvenation-hero',
    dimensions: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.7777777777777777
    },
    defaultOptions: {
      width: 1920,
      quality: 85
    }
  },
  pendry: {
    id: 'pendry',
    area: 'gallery',
    description: 'Pendry Newport Beach',
    publicId: 'gallery/pnb-4-rest-bar-pendry-02-2175',
    defaultOptions: {
      width: 800,
      quality: 90
    }
  },
  ['pelican-hill']: {
    id: 'pelican-hill',
    area: 'gallery',
    description: 'The Resort at Pelican Hill',
    publicId: 'gallery/mw-pelican-bungalow-039-frev-cr4f-brightensheets-1200x520',
    defaultOptions: {
      width: 800,
      quality: 90
    }
  },
  ['lido-house']: {
    id: 'lido-house',
    area: 'gallery',
    description: 'Lido House, Autograph Collection',
    publicId: 'gallery/npbak-table-0065-hor-wide-web',
    defaultOptions: {
      width: 800,
      quality: 90
    }
  },
  ['team-edf24b77-b888-4134-9289-fbeedce1fec9']: {
    id: 'team-edf24b77-b888-4134-9289-fbeedce1fec9',
    area: 'team',
    description: 'team image - team-edf24b77-b888-4134-9289-fbeedce1fec9',
    publicId: 'team/headshots/team-edf24b77-b888-4134-9289-fbeedce1fec9',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 0.75
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  },
  ['team-9c9823c0-d44a-4491-975e-c9dc3a08be1c']: {
    id: 'team-9c9823c0-d44a-4491-975e-c9dc3a08be1c',
    area: 'team',
    description: 'team image - team-9c9823c0-d44a-4491-975e-c9dc3a08be1c',
    publicId: 'team/headshots/team-9c9823c0-d44a-4491-975e-c9dc3a08be1c',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 0.75
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  },
  ['team-8fbfa6fe-3d25-47c3-862b-f20278fa8971']: {
    id: 'team-8fbfa6fe-3d25-47c3-862b-f20278fa8971',
    area: 'team',
    description: 'team image - team-8fbfa6fe-3d25-47c3-862b-f20278fa8971',
    publicId: 'team/headshots/team-8fbfa6fe-3d25-47c3-862b-f20278fa8971',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 0.75
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  },
  ['team-e2c46736-b180-4fae-ad97-bda9d41d1b9b']: {
    id: 'team-e2c46736-b180-4fae-ad97-bda9d41d1b9b',
    area: 'team',
    description: 'team image - team-e2c46736-b180-4fae-ad97-bda9d41d1b9b',
    publicId: 'team/headshots/team-e2c46736-b180-4fae-ad97-bda9d41d1b9b',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 0.75
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  },
  ['team-885a1b9d-234f-4d3a-9e4a-78ff46e7f9ca']: {
    id: 'team-885a1b9d-234f-4d3a-9e4a-78ff46e7f9ca',
    area: 'team',
    description: 'team image - team-885a1b9d-234f-4d3a-9e4a-78ff46e7f9ca',
    publicId: 'team/headshots/team-885a1b9d-234f-4d3a-9e4a-78ff46e7f9ca',
    dimensions: {
      width: 600,
      height: 800,
      aspectRatio: 0.75
    },
    defaultOptions: {
      width: 600,
      quality: 90
    }
  }
};

// Helper function to get optimized image URL
export function getImageUrl(assetId: string, options: { width?: number; height?: number; quality?: number } = {}) {
  const asset = IMAGE_ASSETS[assetId];
  if (!asset) {
    throw new Error(`Image asset not found: ${assetId}`);
  }
  
  // Merge default options with provided options
  const finalOptions = {
    ...asset.defaultOptions,
    ...options
  };
  
  return getCloudinaryUrl(asset.publicId, asset.area, finalOptions);
}

// Helper function to update image URL after upload
export function updateImageAsset(assetId: string, newPublicId: string) {
  if (IMAGE_ASSETS[assetId]) {
    IMAGE_ASSETS[assetId].publicId = newPublicId;
  }
}

// Helper function to register a new image asset
export function registerImageAsset(asset: ImageAsset) {
  IMAGE_ASSETS[asset.id] = asset;
} 