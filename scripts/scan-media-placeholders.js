#!/usr/bin/env node

/**
 * Media Placeholder Scanner
 * 
 * This script scans the codebase for media placeholders by:
 * 1. Looking for CldImage, Image, and img components
 * 2. Identifying potential media placeholders in JSX/TSX files
 * 3. Generating a sitemap of all media locations
 * 4. Saving the results to the media-map data file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'app');
const componentsDir = path.join(rootDir, 'components');
const outputFile = path.join(rootDir, 'app/api/site/media-map/data.json');

// Media placeholder patterns to look for
const MEDIA_COMPONENT_NAMES = ['CldImage', 'Image', 'img', 'CloudinaryImage'];
const MEDIA_PROP_PATTERNS = ['image', 'img', 'photo', 'picture', 'banner', 'hero', 'background', 'logo', 'icon', 'avatar'];

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
        id: 'team',
        name: 'Team',
        description: 'Team page content and media assets',
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

// Parse a file and extract media placeholders
const extractMediaPlaceholders = (filePath, fileType, relativePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    const placeholders = [];
    
    traverse.default(ast, {
      JSXOpeningElement(path) {
        const elementName = path.node.name.name || 
                           (path.node.name.property && path.node.name.property.name);
        
        // Check if this is a media component
        if (MEDIA_COMPONENT_NAMES.includes(elementName)) {
          // Look for id, alt, or placeholder props
          const props = path.node.attributes;
          let placeholderId = null;
          let description = null;
          let dimensions = { width: 0, height: 0, aspectRatio: 16/9 };
          
          for (const prop of props) {
            if (prop.type !== 'JSXAttribute') continue;
            
            const propName = prop.name.name;
            
            // Extract placeholder ID from various props
            if (propName === 'id' || propName === 'placeholderId' || propName === 'alt') {
              if (prop.value.type === 'StringLiteral') {
                placeholderId = prop.value.value;
              } else if (prop.value.type === 'JSXExpressionContainer' && 
                        prop.value.expression.type === 'StringLiteral') {
                placeholderId = prop.value.expression.value;
              }
            }
            
            // Extract description from alt text
            if (propName === 'alt' && !description) {
              if (prop.value.type === 'StringLiteral') {
                description = prop.value.value;
              }
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
          }
          
          // If no explicit placeholder ID, try to generate one from context
          if (!placeholderId) {
            // Try to extract from variable names or component context
            const parentPath = path.findParent(p => p.isJSXElement());
            if (parentPath) {
              const parentProps = parentPath.node.openingElement.attributes;
              for (const prop of parentProps) {
                if (prop.type !== 'JSXAttribute') continue;
                
                const propName = prop.name.name;
                if (MEDIA_PROP_PATTERNS.some(pattern => propName.toLowerCase().includes(pattern))) {
                  if (prop.value.type === 'StringLiteral') {
                    placeholderId = prop.value.value;
                    break;
                  }
                }
              }
            }
            
            // If still no ID, generate one from the file path
            if (!placeholderId) {
              const fileName = path.basename(filePath, path.extname(filePath));
              placeholderId = `${fileType}/${fileName}-${elementName.toLowerCase()}-${placeholders.length + 1}`;
            }
          }
          
          // Calculate aspect ratio if both dimensions are available
          if (dimensions.width && dimensions.height) {
            dimensions.aspectRatio = dimensions.width / dimensions.height;
          }
          
          // Determine which section this belongs to
          let section = 'general';
          let area = 'general';
          
          if (fileType === 'app') {
            // Extract section from file path (e.g., app/home/page.tsx -> home)
            const pathParts = relativePath.split('/');
            if (pathParts.length > 0) {
              section = pathParts[0];
              area = pathParts[0];
            }
          } else if (fileType === 'components') {
            // For components, try to categorize by component type
            if (relativePath.includes('hero') || relativePath.includes('banner')) {
              section = 'hero';
              area = 'hero';
            } else if (relativePath.includes('team')) {
              section = 'team';
              area = 'team';
            }
          }
          
          // Add the placeholder
          placeholders.push({
            id: placeholderId,
            name: formatPlaceholderName(placeholderId),
            description: description || `Media placeholder in ${relativePath}`,
            path: `${fileType}/${area}`,
            area,
            dimensions
          });
        }
      }
    });
    
    return placeholders;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
};

// Format a placeholder ID into a readable name
const formatPlaceholderName = (id) => {
  return id
    .split(/[-_/]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Add placeholders to the sitemap
const addPlaceholdersToSitemap = (placeholders) => {
  for (const placeholder of placeholders) {
    const { area } = placeholder;
    
    // Find the right section to add this placeholder
    let added = false;
    
    for (const page of sitemap) {
      for (const section of page.sections) {
        if (section.id === area) {
          section.mediaPlaceholders.push(placeholder);
          added = true;
          break;
        }
      }
      if (added) break;
    }
    
    // If no matching section found, add to general
    if (!added) {
      sitemap[1].sections[1].mediaPlaceholders.push(placeholder);
    }
  }
};

// Main function
const main = async () => {
  console.log('Starting media placeholder scan...');
  
  // Find all source files
  const sourceFiles = findSourceFiles();
  console.log(`Found ${sourceFiles.length} source files to scan.`);
  
  // Extract placeholders from each file
  let allPlaceholders = [];
  for (const file of sourceFiles) {
    const placeholders = extractMediaPlaceholders(file.path, file.type, file.relativePath);
    allPlaceholders = [...allPlaceholders, ...placeholders];
  }
  
  console.log(`Found ${allPlaceholders.length} unique media placeholders.`);
  
  // Add placeholders to the sitemap
  addPlaceholdersToSitemap(allPlaceholders);
  
  // Count placeholders by section
  let sectionCounts = {};
  for (const page of sitemap) {
    for (const section of page.sections) {
      sectionCounts[`${page.name} > ${section.name}`] = section.mediaPlaceholders.length;
    }
  }
  
  console.log('Media placeholders by section:');
  for (const [section, count] of Object.entries(sectionCounts)) {
    if (count > 0) {
      console.log(`  ${section}: ${count}`);
    }
  }
  
  // Write the sitemap to the output file
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(sitemap, null, 2));
  console.log(`Media map written to ${outputFile}`);
};

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 