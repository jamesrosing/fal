import { type ImageProps } from "next/image";

export type ImageArea = 
  | "hero" // 16:9 for hero sections
  | "article" // 16:9 for article headers
  | "service" // 4:3 for service cards
  | "team" // 1:1 for team member photos
  | "gallery" // 4:3 for gallery items
  | "logo"; // variable, preserved aspect ratio

interface ImagePlacement {
  path: string;
  description: string;
  dimensions: string;
  example: string;
}

export const IMAGE_PLACEMENTS: Record<ImageArea, ImagePlacement> = {
  hero: {
    path: "hero/main-hero",
    description: "Main hero image shown at the top of the home page",
    dimensions: "1920x1080px (16:9)",
    example: "A welcoming image of the practice or a treatment scene"
  },
  article: {
    path: "articles/headers",
    description: "Header images for blog articles and news posts",
    dimensions: "1200x675px (16:9)",
    example: "Relevant image for the article topic"
  },
  service: {
    path: "services",
    description: "Images for service category cards",
    dimensions: "800x600px (4:3)",
    example: "Representative image of the service (e.g., 'dermatology.jpg' for dermatology services)"
  },
  team: {
    path: "team/headshots",
    description: "Professional headshots of team members",
    dimensions: "400x400px (1:1)",
    example: "Professional headshot with neutral background (e.g., 'dr-smith.jpg')"
  },
  gallery: {
    path: "gallery/before-after",
    description: "Before and after treatment images",
    dimensions: "800x600px (4:3)",
    example: "Treatment results (e.g., 'treatment-type/case-1/before.jpg')"
  },
  logo: {
    path: "branding/logo",
    description: "Practice logo and branding assets",
    dimensions: "200px width (variable height)",
    example: "Logo in various formats (main-logo.png, logo-white.png)"
  }
};

interface ImageDimensions {
  width: number;
  height: number;
  className: string;
}

const IMAGE_DIMENSIONS: Record<ImageArea, ImageDimensions> = {
  hero: {
    width: 1920,
    height: 1080,
    className: "object-cover w-full h-[70vh]"
  },
  article: {
    width: 1200,
    height: 675,
    className: "object-cover w-full aspect-[16/9]"
  },
  service: {
    width: 800,
    height: 600,
    className: "object-cover w-full aspect-[4/3]"
  },
  team: {
    width: 400,
    height: 400,
    className: "object-cover w-full aspect-square"
  },
  gallery: {
    width: 800,
    height: 600,
    className: "object-cover w-full aspect-[4/3]"
  },
  logo: {
    width: 200,
    height: 0,
    className: "object-contain w-full"
  }
};

export function getImageProps(area: ImageArea, props?: Partial<ImageProps>): ImageProps {
  const dimensions = IMAGE_DIMENSIONS[area];
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    className: dimensions.className,
    ...props
  };
}

// Example sizes for different areas
export const IMAGE_SIZES = {
  hero: "(min-width: 1280px) 1920px, 100vw",
  article: "(min-width: 1280px) 1200px, (min-width: 768px) 800px, 100vw",
  service: "(min-width: 1280px) 800px, (min-width: 768px) 600px, 100vw",
  team: "(min-width: 1280px) 400px, (min-width: 768px) 300px, 250px",
  gallery: "(min-width: 1280px) 800px, (min-width: 768px) 600px, 100vw",
  logo: "(min-width: 1280px) 200px, 150px"
} as const; 