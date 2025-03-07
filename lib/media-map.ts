import fs from 'fs';
import path from 'path';

/**
 * Media Map Helper Functions
 * 
 * These functions help manage the media map for the site.
 * The media map is a structured representation of all media placeholders
 * organized by section and area.
 * 
 * @see https://next.cloudinary.dev/ for Next Cloudinary documentation
 */

// Types
export interface MediaPlaceholder {
  id: string;
  name: string;
  description: string;
  area: string;
  path: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  cloudinary: {
    optimization: {
      format: string;
      quality: string;
      fetchFormat: string;
    };
    responsive: {
      sizes: string;
      breakpoints: number[];
    };
  };
}

export interface MediaSection {
  id: string;
  name: string;
  path: string;
  sections: {
    id: string;
    name: string;
    description: string;
    mediaPlaceholders: MediaPlaceholder[];
  }[];
}

/**
 * Get the media map from the data file
 * @returns The media map as an array of sections
 */
export async function getMediaMap(): Promise<MediaSection[]> {
  try {
    // Path to the media map data file
    const mediaMapPath = path.join(process.cwd(), 'app/api/site/media-map/data.json');
    
    // Check if the file exists
    if (!fs.existsSync(mediaMapPath)) {
      console.warn('Media map file not found:', mediaMapPath);
      return [];
    }
    
    // Read the file
    const mediaMapData = fs.readFileSync(mediaMapPath, 'utf8');
    
    // Parse the JSON data
    const mediaMap = JSON.parse(mediaMapData) as MediaSection[];
    
    return mediaMap;
  } catch (error) {
    console.error('Error getting media map:', error);
    return [];
  }
}

/**
 * Get a specific media placeholder by ID
 * @param id The ID of the media placeholder
 * @returns The media placeholder or null if not found
 */
export async function getMediaPlaceholder(id: string): Promise<MediaPlaceholder | null> {
  try {
    // Get the media map
    const mediaMap = await getMediaMap();
    
    // Find the placeholder in the media map
    for (const section of mediaMap) {
      for (const area of section.sections) {
        const placeholder = area.mediaPlaceholders.find(p => p.id === id);
        if (placeholder) {
          return placeholder;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting media placeholder:', error);
    return null;
  }
} 