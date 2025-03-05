import * as dotenv from 'dotenv';
// Load environment variables from .env.local
console.log('Current working directory:', process.cwd());
console.log('Attempting to load .env.local file...');
const result = dotenv.config({ path: '.env.local' });
if (result.error) {
  console.error('Error loading .env.local:', result.error);
} else {
  console.log('.env.local file loaded successfully');
}

// Debug: Print all environment variables (Be careful with sensitive data)
console.log('Environment variables:');
console.log('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (value hidden)' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (value hidden)' : 'Not set');

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get current file and directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary credentials
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error(chalk.red.bold('Error: Missing Cloudinary credentials. Make sure your .env.local file contains:'));
  console.error(chalk.yellow('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name'));
  console.error(chalk.yellow('CLOUDINARY_API_KEY=your_api_key'));
  console.error(chalk.yellow('CLOUDINARY_API_SECRET=your_api_secret'));
  process.exit(1);
}

console.log(chalk.green('✓ Cloudinary credentials loaded successfully'));
console.log(chalk.blue(`Cloud name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`));

// Store organization data
const organizationMap = {
  folders: [],
  tags: new Set(),
  urlMap: {},
  metadataMap: {}
};

// Fetch site media map
async function fetchSiteMediaMap() {
  console.log(chalk.blue('Fetching site media map...'));
  
  try {
    // Try to get the media map from the API
    const response = await axios.get('http://localhost:3000/api/site/media-map');
    return response.data;
  } catch (error) {
    console.error(chalk.red('Failed to fetch media map from API:', error.message));
    console.log(chalk.yellow('Falling back to local analysis...'));
    return null;
  }
}

// Extract Vercel Blob URLs using existing script
async function findVercelBlobUrls() {
  console.log(chalk.blue('Finding Vercel Blob URLs in codebase...'));
  
  try {
    // Execute the script that finds Vercel Blob URLs
    const output = execSync('node scripts/find-vercel-blob-urls.js').toString();
    
    // Extract URLs using regex
    const urlPattern = /(https:\/\/[^"'\s]+vercel-storage\.com\/[^"'\s]+\.[a-zA-Z0-9]+)/g;
    const matches = output.match(urlPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  } catch (error) {
    console.error(chalk.red('Failed to find Vercel Blob URLs:', error.message));
    return [];
  }
}

// Generate folder structure from media map
function generateFolderStructure(mediaMap) {
  console.log(chalk.blue('Generating folder structure from media map...'));
  
  const folders = new Set();
  
  // Process each page in the media map
  mediaMap.forEach(page => {
    const pagePath = page.path === '/' ? 'home' : page.path.replace(/\//g, '-').slice(1);
    
    // Add page folder
    folders.add(pagePath);
    
    // Process sections
    page.sections?.forEach(section => {
      const sectionFolder = `${pagePath}/${section.id}`;
      folders.add(sectionFolder);
      
      // Process media placeholders
      section.mediaPlaceholders?.forEach(placeholder => {
        const mediaId = placeholder.id;
        
        // Create specific media folder if needed
        if (placeholder.type === 'gallery' || placeholder.multiple) {
          folders.add(`${sectionFolder}/${mediaId}`);
        }
        
        // Add tags based on page, section, and media type
        const tags = [
          page.id,
          section.id,
          placeholder.type || 'image',
          placeholder.multiple ? 'gallery' : 'single'
        ];
        
        tags.forEach(tag => organizationMap.tags.add(tag));
        
        // Store metadata for this placeholder
        organizationMap.metadataMap[mediaId] = {
          folder: sectionFolder,
          tags: tags.filter(Boolean),
          alt: placeholder.description || `${page.name} - ${section.name}`,
          context: {
            page: page.name,
            section: section.name,
            usage: placeholder.description
          }
        };
      });
    });
  });
  
  // Convert Set to array and store
  organizationMap.folders = Array.from(folders);
  console.log(chalk.green(`Generated ${organizationMap.folders.length} folders`));
}

// Map Vercel Blob URLs to Cloudinary structure
function mapBlobUrlsToCloudinary(blobUrls) {
  console.log(chalk.blue('Mapping Vercel Blob URLs to Cloudinary structure...'));
  
  blobUrls.forEach(url => {
    // Extract filename and content type from URL
    const urlObj = new URL(url);
    const filename = path.basename(urlObj.pathname);
    const nameWithoutExt = filename.split('.')[0];
    const ext = path.extname(filename).toLowerCase();
    
    // Determine content type
    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    const contentType = isVideo ? 'video' : 'image';
    
    // Try to match with known placeholders from media map
    let bestMatch = null;
    let bestMatchScore = 0;
    
    Object.entries(organizationMap.metadataMap).forEach(([id, metadata]) => {
      // Calculate match score based on string similarity
      const score = calculateSimilarity(nameWithoutExt, id);
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = { id, metadata };
      }
    });
    
    // If good match found (score > 0.4), use that metadata
    let mappedMetadata;
    if (bestMatch && bestMatchScore > 0.4) {
      mappedMetadata = { ...bestMatch.metadata };
      mappedMetadata.tags.push(contentType);
      mappedMetadata.publicId = `${bestMatch.metadata.folder}/${nameWithoutExt}`;
    } else {
      // Otherwise, use fallback organization based on filename patterns
      let folder = 'uncategorized';
      const tags = [contentType];
      
      // Analyze filename to determine category
      if (nameWithoutExt.includes('dermatology')) {
        folder = 'services/dermatology';
        tags.push('service', 'dermatology');
      } else if (nameWithoutExt.includes('functional-medicine')) {
        folder = 'services/functional-medicine';
        tags.push('service', 'functional-medicine');
      } else if (nameWithoutExt.includes('medical-spa')) {
        folder = 'services/medical-spa';
        tags.push('service', 'medical-spa');
      } else if (nameWithoutExt.includes('team') || nameWithoutExt.includes('headshot')) {
        folder = 'team/headshots';
        tags.push('team', 'headshot');
      } else if (nameWithoutExt.includes('procedure')) {
        folder = 'procedures';
        tags.push('procedure');
      } else if (nameWithoutExt.includes('hero')) {
        folder = 'marketing/heroes';
        tags.push('hero', 'marketing');
      } else if (nameWithoutExt.includes('gallery')) {
        folder = 'gallery';
        tags.push('gallery');
      }
      
      // Add folder to the list if not already present
      if (!organizationMap.folders.includes(folder)) {
        organizationMap.folders.push(folder);
      }
      
      // Add tags to the global tags set
      tags.forEach(tag => organizationMap.tags.add(tag));
      
      mappedMetadata = {
        folder,
        tags,
        alt: nameWithoutExt.replace(/-/g, ' '),
        publicId: `${folder}/${nameWithoutExt}`,
        context: {
          usage: nameWithoutExt.replace(/-/g, ' ')
        }
      };
    }
    
    // Store URL mapping
    organizationMap.urlMap[url] = mappedMetadata;
  });
  
  console.log(chalk.green(`Mapped ${Object.keys(organizationMap.urlMap).length} URLs to Cloudinary structure`));
}

// Check if a folder exists in Cloudinary
async function checkFolderExists(folderPath) {
  try {
    await cloudinary.api.create_folder(folderPath);
    return false; // Folder did not exist, was just created
  } catch (error) {
    if (error.error && error.error.message && error.error.message.includes('already exists')) {
      return true; // Folder already exists
    }
    throw error; // Some other error
  }
}

// Create folders in Cloudinary
async function createCloudinaryFolders() {
  console.log(chalk.blue('Creating folders in Cloudinary...'));
  
  // First check if root folders already exist
  console.log(chalk.yellow('Checking existing Cloudinary structure...'));
  
  try {
    const rootFolders = await cloudinary.api.root_folders();
    console.log(chalk.green(`Found ${rootFolders.folders.length} existing root folders in Cloudinary`));
    
    // Log existing folders
    if (rootFolders.folders.length > 0) {
      console.log(chalk.blue('Existing root folders:'));
      rootFolders.folders.forEach(folder => {
        console.log(chalk.yellow(`- ${folder.name}`));
      });
    }
  } catch (error) {
    console.error(chalk.red('Error checking Cloudinary folders:', error.message));
  }
  
  // Track created and existing folders
  const createdFolders = new Set();
  const existingFolders = new Set();
  
  for (const folder of organizationMap.folders) {
    try {
      // Split folder path and create each level
      const parts = folder.split('/');
      let currentPath = '';
      
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!createdFolders.has(currentPath) && !existingFolders.has(currentPath)) {
          const exists = await checkFolderExists(currentPath);
          
          if (exists) {
            existingFolders.add(currentPath);
            console.log(chalk.yellow(`Folder already exists: ${currentPath}`));
          } else {
            createdFolders.add(currentPath);
            console.log(chalk.green(`Created folder: ${currentPath}`));
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Failed to create folder ${folder}:`, error.message));
    }
  }
  
  console.log(chalk.green(`Created ${createdFolders.size} new folders in Cloudinary`));
  console.log(chalk.yellow(`Found ${existingFolders.size} existing folders in Cloudinary`));
}

// Generate migration mapping file
function generateMigrationMap() {
  console.log(chalk.blue('Generating migration mapping file...'));
  
  const migrationMap = {};
  
  Object.entries(organizationMap.urlMap).forEach(([url, metadata]) => {
    migrationMap[url] = {
      folder: metadata.folder,
      publicId: metadata.publicId.split('/').pop(),
      tags: metadata.tags,
      alt: metadata.alt,
      context: metadata.context
    };
  });
  
  fs.writeFileSync('./cloudinary-migration-map.json', JSON.stringify(migrationMap, null, 2));
  console.log(chalk.green('Created cloudinary-migration-map.json with URL mappings'));
}

// Helper function to calculate string similarity
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  return 1.0 - distance / maxLength;
}

// Helper function for Levenshtein distance
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create distance matrix
  const d = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,        // deletion
        d[i][j - 1] + 1,        // insertion
        d[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  return d[m][n];
}

// Generate documentation for the organization structure
function generateDocumentation() {
  console.log(chalk.blue('Generating organization documentation...'));
  
  const tags = Array.from(organizationMap.tags);
  
  // Create docs directory if it doesn't exist
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const doc = `# Cloudinary Organization Structure

## Folder Structure

\`\`\`
${organizationMap.folders.sort().map(f => f).join('\n')}
\`\`\`

## Tags

${tags.sort().map(t => `- ${t}`).join('\n')}

## Usage Guidelines

### Naming Conventions

- Use descriptive names that reflect the content of the image
- Follow the pattern: \`[section]-[description]-[variant]\`
- Example: \`dermatology-acne-treatment-before\`

### Tag Usage

- Always include content type tags: \`image\` or \`video\`
- Use page and section tags to categorize assets
- Add functional tags like \`featured\`, \`hero\`, or \`gallery\` as needed

### Transformation Best Practices

- Use Cloudinary's transformation features instead of storing multiple versions
- Leverage \`f_auto\` and \`q_auto\` for automatic format and quality optimization
- Use responsive sizing with breakpoints for different devices

### Component Usage

\`\`\`tsx
// Import the CloudinaryImage component
import { CloudinaryImage } from '@/lib/cloudinary';

// Basic usage
<CloudinaryImage 
  publicId="page/section/image-name" 
  alt="Description" 
/>

// With area (using predefined dimensions)
<CloudinaryImage 
  publicId="page/section/image-name" 
  area="hero" 
  alt="Hero image" 
/>

// With custom options
<CloudinaryImage 
  publicId="page/section/image-name" 
  alt="Custom image" 
  options={{ width: 500, height: 300, crop: 'fill' }} 
  expandOnHover
/>
\`\`\`

### Organizing New Assets

1. Determine the appropriate folder based on the page and section where the asset will be used
2. Use descriptive public IDs following the naming convention
3. Apply relevant tags for better searchability and organization
4. Include proper alt text and context metadata

## Existing and New Structure Integration

The folder structure shown above has been integrated with your existing Cloudinary organization.
Any folders that already existed have been preserved, and new folders have been added where needed
`;
  
  fs.writeFileSync('./docs/cloudinary-organization.md', doc);
  console.log(chalk.green('Created docs/cloudinary-organization.md with organization documentation'));
}

// Main function
async function main() {
  try {
    console.log(chalk.blue.bold('Starting Cloudinary Organization Generation...'));
    
    // Fetch site media map
    const mediaMap = await fetchSiteMediaMap();
    
    // Generate folder structure from media map
    if (mediaMap) {
      generateFolderStructure(mediaMap);
    } else {
      // Fallback structure if media map is unavailable
      organizationMap.folders = [
        'home/hero',
        'services/dermatology',
        'services/functional-medicine',
        'services/medical-spa',
        'team/headshots',
        'procedures',
        'procedures/before-after',
        'marketing/heroes',
        'gallery'
      ];
      
      console.log(chalk.yellow('Using fallback folder structure'));
    }
    
    // Find Vercel Blob URLs
    const blobUrls = await findVercelBlobUrls();
    
    // Map URLs to Cloudinary structure
    mapBlobUrlsToCloudinary(blobUrls);
    
    // Create folders in Cloudinary
    await createCloudinaryFolders();
    
    // Generate migration mapping file
    generateMigrationMap();
    
    // Generate documentation
    generateDocumentation();
    
    console.log(chalk.green.bold('Cloudinary organization structure generated successfully!'));
    console.log(chalk.yellow(`Next steps:
1. Review the organization in docs/cloudinary-organization.md
2. Use cloudinary-migration-map.json for image uploads
3. Create a script to replace Vercel Blob URLs with Cloudinary URLs`));
    
  } catch (error) {
    console.error(chalk.red.bold('Failed to generate Cloudinary organization:'), error);
    process.exit(1);
  }
}

// Run the main function
main(); 