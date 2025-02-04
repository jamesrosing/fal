import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type ImageArea = 
  | "hero" // 16:9 for hero sections
  | "article" // 16:9 for article headers
  | "service" // 4:3 for service cards
  | "team" // 1:1 for team member photos
  | "gallery" // 4:3 for gallery items
  | "logo"; // variable, preserved aspect ratio

export interface ImagePlacement {
  path: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  transformations: string[];
}

// Define specific placements and their requirements
export const IMAGE_PLACEMENTS: Record<ImageArea, ImagePlacement> = {
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
    path: "team",
    description: "Team member headshots",
    dimensions: {
      width: 400,
      height: 400,
      aspectRatio: 1
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
      height: 0, // Height will be auto-calculated
      aspectRatio: 0 // Preserve original aspect ratio
    },
    transformations: ["c_scale", "f_auto", "q_auto"]
  }
};

// Helper function to generate Cloudinary URL with proper transformations
export function getCloudinaryUrl(publicId: string, area: ImageArea, options: { width?: number; height?: number; quality?: number } = {}) {
  const placement = IMAGE_PLACEMENTS[area];
  const transformations = [...placement.transformations];
  
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  return cloudinary.url(publicId, {
    transformation: transformations.join(',')
  });
}

export default cloudinary; 