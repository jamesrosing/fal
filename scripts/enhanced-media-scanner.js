#!/usr/bin/env node

/**
 * Enhanced Media Placeholder Scanner
 * 
 * This script scans the codebase for all types of media placeholders:
 * 1. Looking for CldImage, Image, img, video, and BackgroundVideo components
 * 2. Extracting existing Cloudinary URLs from src attributes
 * 3. Identifying potential media placeholders in JSX/TSX files
 * 4. Generating a sitemap of all media locations
 * 5. Saving the results to the database and media-map data file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'app');
const componentsDir = path.join(rootDir, 'components');
const outputFile = path.join(rootDir, 'app/api/site/media-map/data.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Media component patterns to look for
const MEDIA_COMPONENT_NAMES = ['CldImage', 'Image', 'img', 'CloudinaryImage', 'video', 'BackgroundVideo', 'source'];
const MEDIA_PROP_PATTERNS = ['image', 'img', 'photo', 'picture', 'banner', 'hero', 'background', 'logo', 'icon', 'avatar', 'src', 'poster', 'fallbackImage', 'sources'];

// Cloudinary URL pattern
const CLOUDINARY_URL_PATTERN = /https:\/\/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/([^"']+)/;
const CLOUDINARY_VIDEO_URL_PATTERN = /https:\/\/res\.cloudinary\.com\/([^\/]+)\/video\/upload\/([^"']+)/;

// Structure to hold our sitemap
const sitemap = [
  {
    id: 'app',
    name: 'App',
    path: '/app',
    sections: [
      {
        id: 'home',
        name: 'Home',
        description: 'Home page content and media assets',
        mediaPlaceholders: []
      },
      {
        id: 'about',
        name: 'About',
        description: 'About page content and media assets',
        mediaPlaceholders: []
      },
      {
        id: 'services',
        name: 'Services',
        description: 'Services page content and media assets',
        mediaPlaceholders: []
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Contact page content and media assets',
        mediaPlaceholders: []
      }
    ]
  },
  {
    id: 'components',
    name: 'Components',
    path: '/components',
    sections: [
      {
        id: 'sections',
        name: 'Sections',
        description: 'Section components',
        mediaPlaceholders: []
      },
      {
        id: 'hero',
        name: 'Hero',
        description: 'Hero components and banners',
        mediaPlaceholders: []
      },
      {
        id: 'general',
        name: 'General',
        description: 'General content for Components',
        mediaPlaceholders: []
      }
    ]
  }
];

// Find all JSX/TSX files in the app and components directories
const findSourceFiles = () => {
  console.log('Scanning for source files...');
  const appFiles = globSync('**/*.{jsx,tsx}', { cwd: appDir, ignore: ['**/node_modules/**'] });
  const componentFiles = globSync('**/*.{jsx,tsx}', { cwd: componentsDir, ignore: ['**/node_modules/**'] });
  
  return [
    ...appFiles.map(file => ({ path: path.join(appDir, file), type: 'app', relativePath: file })),
    ...componentFiles.map(file => ({ path: path.join(componentsDir, file), type: 'components', relativePath: file }))
  ];
};

// Extract Cloudinary ID from URL
const extractCloudinaryId = (url) => {
  if (!url) return null;
  
  // Handle both image and video URLs
  const imageMatch = url.match(CLOUDINARY_URL_PATTERN);
  const videoMatch = url.match(CLOUDINARY_VIDEO_URL_PATTERN);
  
  if (imageMatch && imageMatch[2]) {
    // Extract the public ID from the URL
    return {
      publicId: imageMatch[2].split('/').pop().split('.')[0],
      type: 'image'
    };
  } else if (videoMatch && videoMatch[2]) {
    return {
      publicId: videoMatch[2].split('/').pop().split('.')[0],
      type: 'video'
    };
  }
  
  return null;
};

// Parse a file and extract media placeholders
const extractMediaPlaceholders = (filePath, fileType, relativePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // First, try to find direct Cloudinary URLs in the content
    const directUrls = [];
    let match;
    
    // Find all image URLs
    const imageRegex = new RegExp(CLOUDINARY_URL_PATTERN, 'g');
    while ((match = imageRegex.exec(content)) !== null) {
      directUrls.push({
        url: match[0],
        type: 'image'
      });
    }
    
    // Find all video URLs
    const videoRegex = new RegExp(CLOUDINARY_VIDEO_URL_PATTERN, 'g');
    while ((match = videoRegex.exec(content)) !== null) {
      directUrls.push({
        url: match[0],
        type: 'video'
      });
    }
    
    // Now parse the AST for more structured analysis
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    const placeholders = [];
    
    // Determine component name and page path
    const componentName = path.basename(filePath, path.extname(filePath));
    const isSection = relativePath.includes('sections/');
    const sectionName = isSection ? componentName.replace('-section', '') : null;
    
    // Determine page path based on file location
    let pagePath = 'general';
    if (relativePath.startsWith('page.')) {
      pagePath = 'home';
    } else if (relativePath.includes('/')) {
      const parts = relativePath.split('/');
      if (parts.length > 1 && parts[parts.length - 1] === 'page.tsx') {
        pagePath = parts[parts.length - 2];
      }
    }
    
    // For section components, use a more specific approach
    if (isSection) {
      pagePath = 'home'; // Most sections are on the home page
    }
    
    traverse.default(ast, {
      JSXOpeningElement(path) {
        const elementName = path.node.name.name || 
                           (path.node.name.property && path.node.name.property.name);
        
        // Check if this is a media component
        if (MEDIA_COMPONENT_NAMES.includes(elementName)) {
          // Look for id, alt, src, or placeholder props
          const props = path.node.attributes;
          let placeholderId = null;
          let description = null;
          let dimensions = { width: 0, height: 0, aspectRatio: 16/9 };
          let mediaType = 'image';
          let cloudinaryUrl = null;
          
          for (const prop of props) {
            if (prop.type !== 'JSXAttribute') continue;
            
            const propName = prop.name.name;
            
            // Extract placeholder ID from various props
            if (propName === 'id' || propName === 'placeholderId' || propName === 'alt') {
              placeholderId = extractStringValue(prop.value);
            }
            
            // Extract description from alt text
            if (propName === 'alt' && !description) {
              description = extractStringValue(prop.value);
            }
            
            // Extract dimensions
            if (propName === 'width' && prop.value.type === 'JSXExpressionContainer') {
              if (prop.value.expression.type === 'NumericLiteral') {
                dimensions.width = prop.value.expression.value;
              }
            }
            
            if (propName === 'height' && prop.value.type === 'JSXExpressionContainer') {
              if (prop.value.expression.type === 'NumericLiteral') {
                dimensions.height = prop.value.expression.value;
              }
            }
            
            // Extract src URL
            if (propName === 'src') {
              cloudinaryUrl = extractStringValue(prop.value);
            }
            
            // Check for video-specific props
            if (elementName === 'video' || elementName === 'BackgroundVideo') {
              mediaType = 'video';
            }
            
            // Check poster for BackgroundVideo
            if (propName === 'poster') {
              const posterUrl = extractStringValue(prop.value);
              if (posterUrl && !cloudinaryUrl) {
                cloudinaryUrl = posterUrl;
              }
            }
          }
          
          // If we found a Cloudinary URL, extract the ID
          let cloudinaryId = null;
          if (cloudinaryUrl) {
            const extracted = extractCloudinaryId(cloudinaryUrl);
            if (extracted) {
              cloudinaryId = extracted.publicId;
              mediaType = extracted.type;
            }
          }
          
          // Generate a placeholder ID if none was found
          if (!placeholderId) {
            // Use component name and a counter for uniqueness
            placeholderId = `${pagePath}-${sectionName || elementName}-${placeholders.length + 1}`;
          }
          
          // Generate a description if none was found
          if (!description) {
            description = `${sectionName ? `${sectionName} section` : elementName} media`;
          }
          
          // Calculate aspect ratio if both dimensions are available
          if (dimensions.width && dimensions.height) {
            dimensions.aspectRatio = dimensions.width / dimensions.height;
          }
          
          // Add to placeholders
          placeholders.push({
            id: placeholderId,
            name: formatPlaceholderName(placeholderId),
            description,
            path: pagePath,
            area: sectionName || 'general',
            dimensions,
            mediaType,
            cloudinaryId
          });
        }
      }
    });
    
    // Also process any direct URLs found
    directUrls.forEach((urlInfo, index) => {
      const extracted = extractCloudinaryId(urlInfo.url);
      if (extracted) {
        const placeholderId = `${pagePath}-${sectionName || 'direct'}-${index + 1}`;
        
        // Check if this URL is already in our placeholders
        const exists = placeholders.some(p => p.cloudinaryId === extracted.publicId);
        if (!exists) {
          placeholders.push({
            id: placeholderId,
            name: formatPlaceholderName(placeholderId),
            description: `${sectionName ? `${sectionName} section` : 'Component'} media`,
            path: pagePath,
            area: sectionName || 'general',
            dimensions: { width: 0, height: 0, aspectRatio: 16/9 },
            mediaType: urlInfo.type,
            cloudinaryId: extracted.publicId
          });
        }
      }
    });
    
    return placeholders;
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return [];
  }
};

// Format placeholder name for display
const formatPlaceholderName = (id) => {
  return id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Add placeholders to the sitemap
const addPlaceholdersToSitemap = (placeholders) => {
  placeholders.forEach(placeholder => {
    // Find the appropriate section in the sitemap
    let section = null;
    
    for (const app of sitemap) {
      for (const sec of app.sections) {
        if (
          (sec.id === placeholder.area) || 
          (sec.id === placeholder.path) ||
          (sec.id === 'general')
        ) {
          section = sec;
          break;
        }
      }
      if (section) break;
    }
    
    // If no matching section was found, add to general
    if (!section) {
      section = sitemap[1].sections[2]; // general section
    }
    
    // Add the placeholder to the section
    section.mediaPlaceholders.push(placeholder);
  });
};

// Save placeholders to the database
const savePlaceholdersToDatabase = async (placeholders) => {
  console.log(`Saving ${placeholders.length} placeholders to database...`);
  
  for (const placeholder of placeholders) {
    try {
      // Check if placeholder already exists
      const { data: existing } = await supabase
        .from('media_placeholders')
        .select('*')
        .eq('id', placeholder.id);
      
      if (existing && existing.length > 0) {
        // Update existing placeholder
        await supabase
          .from('media_placeholders')
          .update({
            name: placeholder.name,
            description: placeholder.description,
            path: placeholder.path,
            area: placeholder.area,
            dimensions: placeholder.dimensions,
            media_type: placeholder.mediaType
          })
          .eq('id', placeholder.id);
        
        console.log(`Updated placeholder: ${placeholder.id}`);
      } else {
        // Create new placeholder
        await supabase
          .from('media_placeholders')
          .insert({
            id: placeholder.id,
            name: placeholder.name,
            description: placeholder.description,
            path: placeholder.path,
            area: placeholder.area,
            dimensions: placeholder.dimensions,
            media_type: placeholder.mediaType
          });
        
        console.log(`Created placeholder: ${placeholder.id}`);
      }
      
      // If we have a Cloudinary ID, create or update the media asset
      if (placeholder.cloudinaryId) {
        // Check if asset already exists
        const { data: existingAsset } = await supabase
          .from('media_assets')
          .select('*')
          .eq('placeholder_id', placeholder.id);
        
        if (existingAsset && existingAsset.length > 0) {
          // Update existing asset
          await supabase
            .from('media_assets')
            .update({
              cloudinary_id: placeholder.cloudinaryId
            })
            .eq('placeholder_id', placeholder.id);
          
          console.log(`Updated asset for placeholder: ${placeholder.id}`);
        } else {
          // Create new asset
          await supabase
            .from('media_assets')
            .insert({
              placeholder_id: placeholder.id,
              cloudinary_id: placeholder.cloudinaryId,
              area: placeholder.area
            });
          
          console.log(`Created asset for placeholder: ${placeholder.id}`);
        }
      }
    } catch (error) {
      console.error(`Error saving placeholder ${placeholder.id}:`, error);
    }
  }
};

// Main function
const main = async () => {
  try {
    console.log('Starting media placeholder scan...');
    
    // Find all source files
    const sourceFiles = findSourceFiles();
    console.log(`Found ${sourceFiles.length} source files to scan.`);
    
    // Extract placeholders from each file
    const allPlaceholders = [];
    for (const file of sourceFiles) {
      const placeholders = extractMediaPlaceholders(file.path, file.type, file.relativePath);
      allPlaceholders.push(...placeholders);
    }
    
    console.log(`Found ${allPlaceholders.length} media placeholders.`);
    
    // Add placeholders to the sitemap
    addPlaceholdersToSitemap(allPlaceholders);
    
    // Save the sitemap to the output file
    fs.writeFileSync(outputFile, JSON.stringify(sitemap, null, 2));
    console.log(`Saved sitemap to ${outputFile}`);
    
    // Save placeholders to the database
    await savePlaceholdersToDatabase(allPlaceholders);
    
    console.log('Media placeholder scan complete!');
  } catch (error) {
    console.error('Error scanning media placeholders:', error);
  }
};

// Helper function to extract string value from JSX attribute
function extractStringValue(node) {
  if (!node) return null;
  
  if (node.type === 'StringLiteral') {
    return node.value;
  } else if (node.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'StringLiteral') {
      return node.expression.value;
    } else if (node.expression.type === 'TemplateLiteral' && 
              node.expression.quasis && 
              node.expression.quasis.length > 0) {
      // For template literals, just get the static parts
      return node.expression.quasis.map(q => q.value.raw).join('...');
    } else if (node.expression.type === 'CallExpression') {
      // For function calls like getCloudinaryUrl(), try to extract the first argument
      if (node.expression.arguments && node.expression.arguments.length > 0) {
        const firstArg = node.expression.arguments[0];
        if (firstArg.type === 'StringLiteral') {
          return firstArg.value;
        }
      }
    }
  }
  
  return null;
}

// Run the main function
main().catch(console.error); 