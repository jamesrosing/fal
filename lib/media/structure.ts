/**
 * Media Directory Structure
 * 
 * This file defines the physical directory structure for media assets in the project.
 * It helps validate asset paths and provides a reference for where assets should be stored.
 */

export type DirectoryNode = {
  [key: string]: DirectoryNode | null;
}

export type DirectoryStructure = {
  public: DirectoryNode;
  components: DirectoryNode;
  cloudinary: DirectoryNode;
}

export const DIRECTORY_STRUCTURE: DirectoryStructure = {
  // Public directory structure for static assets
  public: {
    images: {
      global: {
        logos: null,
        icons: null,
        ui: null
      },
      pages: {
        home: null,
        about: null,
        services: {
          'plastic-surgery': null,
          'dermatology': null,
          'medical-spa': null,
          'functional-medicine': null
        },
        team: null
      }
    },
    videos: {
      backgrounds: null,
      content: null
    }
  },

  // Component-specific assets
  components: {
    Hero: {
      assets: null
    },
    ServiceCard: {
      assets: null
    },
    TeamMember: {
      assets: null
    }
  },

  // Cloudinary structure for remote assets
  cloudinary: {
    hero: null,
    articles: null,
    services: {
      'plastic-surgery': null,
      'dermatology': null,
      'medical-spa': null,
      'functional-medicine': null
    },
    team: {
      headshots: null
    },
    gallery: null,
    branding: null,
    videos: {
      backgrounds: null,
      thumbnails: null
    }
  }
};

/**
 * Validate a path against the directory structure
 * 
 * @param {string} path - The path to validate
 * @param {string} type - The type of path (public, components, cloudinary)
 * @returns {boolean} - Whether the path is valid
 */
export function validatePath(path: string, type: keyof DirectoryStructure = 'cloudinary'): boolean {
  if (!path) return false;
  
  const pathParts = path.split('/');
  let currentLevel = DIRECTORY_STRUCTURE[type] as DirectoryNode | null;
  
  if (!currentLevel) return false;
  
  for (const part of pathParts) {
    if (!currentLevel) return true; // null level means any subpath is valid
    if (!(part in currentLevel)) return false;
    currentLevel = currentLevel[part];
  }
  
  return true;
}

/**
 * Generate a path for a media asset
 * 
 * @param {string} type - The type of asset (public, components, cloudinary)
 * @param {string[]} pathParts - The parts of the path
 * @returns {string} - The generated path
 */
export function generatePath(type: keyof DirectoryStructure, pathParts: string[]): string {
  if (!pathParts || !pathParts.length) return '';
  
  // Validate the path
  const path = pathParts.join('/');
  if (!validatePath(path, type)) {
    console.warn(`Invalid path: ${path} for type ${type}`);
  }
  
  return path;
}

export default DIRECTORY_STRUCTURE; 