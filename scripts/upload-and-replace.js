import * as dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { globSync } from 'glob';
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

// Load the migration map
let migrationMap;
try {
  migrationMap = JSON.parse(fs.readFileSync('./cloudinary-migration-map.json', 'utf8'));
} catch (error) {
  console.error(chalk.red.bold('Error: Migration map not found. Please run generate-cloudinary-organization.js first.'));
  process.exit(1);
}

const tempDir = path.join(process.cwd(), 'temp-migration');
const replacementMap = {};

// Create needed directories
function createDirectories() {
  console.log(chalk.blue('Creating temporary directories...'));
  
  // Collect all directories from migrationMap
  const directories = new Set();
  Object.values(migrationMap).forEach(config => {
    if (config.folder) {
      directories.add(path.join(tempDir, config.folder));
    }
  });
  
  // Create each directory
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(chalk.green(`Created directory: ${dir}`));
    }
  });
}

// Check if an asset already exists in Cloudinary
async function checkAssetExists(publicId) {
  try {
    await cloudinary.api.resource(publicId);
    return true; // Asset exists
  } catch (error) {
    if (error.error && error.error.http_code === 404) {
      return false; // Asset does not exist
    }
    // For other errors, log but assume it doesn't exist
    console.error(chalk.yellow(`Error checking if asset exists (${publicId}):`, error.message));
    return false;
  }
}

// Create a simple transparent image as a placeholder
function createTransparentPlaceholder() {
  const tempDir = path.join(process.cwd(), 'temp-migration');
  const placeholderPath = path.join(tempDir, 'transparent-placeholder.png');
  
  // Create a 1x1 transparent PNG
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(placeholderPath, buffer);
  return placeholderPath;
}

// Upload placeholder images to Cloudinary
async function uploadPlaceholderImages() {
  console.log('Checking for existing assets in Cloudinary...');
  
  // Check for existing assets in Cloudinary
  const existingAssets = [];
  for (const [vercelUrl, cloudinaryInfo] of Object.entries(migrationMap)) {
    try {
      const exists = await checkAssetExists(cloudinaryInfo.publicId);
      if (exists) {
        existingAssets.push(cloudinaryInfo.publicId);
        replacementMap[vercelUrl] = {
          publicId: cloudinaryInfo.publicId,
          url: cloudinaryInfo.url
        };
      }
    } catch (error) {
      console.error(`Error checking if asset exists: ${error.message}`);
    }
  }
  
  console.log(`Found ${existingAssets.length} existing assets in Cloudinary`);
  
  // Find placeholder images
  let placeholderImages = [];
  
  // First try to find images in public/images/place
  try {
    if (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'place'))) {
      const placeImages = globSync(path.join(process.cwd(), 'public', 'images', 'place', '**', '*.{jpg,jpeg,png,webp,gif}'));
      placeholderImages = placeholderImages.concat(placeImages);
      console.log(`Found ${placeImages.length} placeholder images in public/images/place`);
    } else {
      console.log('public/images/place directory does not exist');
    }
  } catch (error) {
    console.error(`Error searching for placeholder images in public/images/place: ${error.message}`);
  }
  
  // If no images found in place directory, search the entire public/images directory
  if (placeholderImages.length === 0) {
    try {
      if (fs.existsSync(path.join(process.cwd(), 'public', 'images'))) {
        const allImages = globSync(path.join(process.cwd(), 'public', 'images', '**', '*.{jpg,jpeg,png,webp,gif}'));
        placeholderImages = placeholderImages.concat(allImages);
        console.log(`Found ${allImages.length} images in public/images directory`);
      } else {
        console.log('public/images directory does not exist');
      }
    } catch (error) {
      console.error(`Error searching for placeholder images in public/images: ${error.message}`);
    }
  }
  
  // If still no images found, try the public directory
  if (placeholderImages.length === 0) {
    try {
      if (fs.existsSync(path.join(process.cwd(), 'public'))) {
        const publicImages = globSync(path.join(process.cwd(), 'public', '**', '*.{jpg,jpeg,png,webp,gif}'));
        placeholderImages = placeholderImages.concat(publicImages);
        console.log(`Found ${publicImages.length} images in public directory`);
      } else {
        console.log('public directory does not exist');
      }
    } catch (error) {
      console.error(`Error searching for placeholder images in public: ${error.message}`);
    }
  }
  
  // If no placeholder images found, create a warning
  if (placeholderImages.length === 0) {
    console.warn(chalk.yellow('Warning: No placeholder images found. Using Cloudinary placeholders instead.'));
  }
  
  // Upload placeholder images (skipping existing ones)
  for (const [vercelUrl, cloudinaryInfo] of Object.entries(migrationMap)) {
    // Skip if already in the replacement map (existing asset)
    if (replacementMap[vercelUrl]) {
      continue;
    }
    
    const fullPublicId = `${cloudinaryInfo.folder}/${cloudinaryInfo.publicId}`;
    
    // Skip if the asset already exists in Cloudinary
    if (existingAssets.includes(fullPublicId)) {
      console.log(chalk.yellow(`Skipping upload for existing asset: ${fullPublicId}`));
      continue;
    }
    
    try {
      if (placeholderImages.length === 0) {
        // No placeholder images found, create a transparent placeholder
        console.log(chalk.yellow(`No placeholder images found for ${fullPublicId}, using a transparent placeholder`));
        
        // Create and upload a transparent placeholder
        const placeholderPath = createTransparentPlaceholder();
        const uploadResult = await cloudinary.uploader.upload(placeholderPath, {
          public_id: cloudinaryInfo.publicId,
          folder: cloudinaryInfo.folder,
          tags: cloudinaryInfo.tags.concat(['placeholder']),
          context: cloudinaryInfo.alt ? `alt=${cloudinaryInfo.alt}` : undefined,
          resource_type: "image",
          overwrite: true
        });
        
        // Store the mapping
        replacementMap[vercelUrl] = {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url
        };
        
        console.log(chalk.green(`Used transparent placeholder for: ${cloudinaryInfo.folder}/${cloudinaryInfo.publicId}`));
      } else {
        // Find matching placeholder image by name similarity
        let bestMatch = null;
        let bestScore = 0;
        
        for (const file of placeholderImages) {
          const basename = path.basename(file, path.extname(file));
          const score = calculateSimilarity(basename, cloudinaryInfo.publicId);
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = file;
          }
        }
        
        // If we found a good match (score > 0.3) or it's the best we can do
        if (bestMatch && (bestScore > 0.3 || placeholderImages.length === 1)) {
          console.log(chalk.blue(`Using ${path.basename(bestMatch)} for ${cloudinaryInfo.folder}/${cloudinaryInfo.publicId} (match score: ${bestScore.toFixed(2)})`));
          
          // Upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(bestMatch, {
            public_id: cloudinaryInfo.publicId,
            folder: cloudinaryInfo.folder,
            tags: cloudinaryInfo.tags,
            context: cloudinaryInfo.alt ? `alt=${cloudinaryInfo.alt}` : undefined,
            resource_type: "auto",
            overwrite: true
          });
          
          // Store the mapping
          replacementMap[vercelUrl] = {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          
          console.log(chalk.green(`Uploaded: ${bestMatch} to ${cloudinaryInfo.folder}/${cloudinaryInfo.publicId}`));
        } else {
          console.log(chalk.yellow(`No good match found for ${cloudinaryInfo.publicId}, using a transparent placeholder`));
          
          // Create and upload a transparent placeholder
          const placeholderPath = createTransparentPlaceholder();
          const uploadResult = await cloudinary.uploader.upload(placeholderPath, {
            public_id: cloudinaryInfo.publicId,
            folder: cloudinaryInfo.folder,
            tags: cloudinaryInfo.tags.concat(['placeholder']),
            context: cloudinaryInfo.alt ? `alt=${cloudinaryInfo.alt}` : undefined,
            resource_type: "image",
            overwrite: true
          });
          
          // Store the mapping
          replacementMap[vercelUrl] = {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          
          console.log(chalk.green(`Used transparent placeholder for: ${cloudinaryInfo.folder}/${cloudinaryInfo.publicId}`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error uploading for ${cloudinaryInfo.publicId}:`, error.message));
    }
  }
  
  // Save the replacement map
  fs.writeFileSync('./cloudinary-replacement-map.json', JSON.stringify(replacementMap, null, 2));
  console.log(chalk.green('Created cloudinary-replacement-map.json with URL mappings'));
}

// Replace Vercel Blob URLs with Cloudinary URLs in code
async function replaceUrlsInCode() {
  console.log('Replacing Vercel Blob URLs in codebase...');
  
  // Find all files that might contain Vercel Blob URLs
  const filesToSearch = globSync([
    '**/*.{js,jsx,ts,tsx,json,md,html,css}',
    '!node_modules/**',
    '!.next/**',
    '!.git/**',
    '!temp-migration/**'
  ]);
  
  console.log(`Found ${filesToSearch.length} files to search for URL replacements`);
  
  let totalReplacements = 0;
  let filesUpdated = 0;
  
  for (const filePath of filesToSearch) {
    // Skip directories
    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        continue;
      }
      
      let fileContent = fs.readFileSync(filePath, 'utf8');
      let originalContent = fileContent;
      let fileReplacements = 0;
      
      // Replace URLs in the file
      for (const [vercelUrl, cloudinaryInfo] of Object.entries(replacementMap)) {
        // Escape special characters in the URL for regex
        const escapedUrl = escapeRegExp(vercelUrl);
        
        // Different patterns to match
        const patterns = [
          // Direct URL in quotes
          new RegExp(`"${escapedUrl}"`, 'g'),
          new RegExp(`'${escapedUrl}'`, 'g'),
          new RegExp(`\`${escapedUrl}\``, 'g'),
          
          // URL in src attribute
          new RegExp(`src=["']${escapedUrl}["']`, 'g'),
          
          // URL in Image component
          new RegExp(`src=\\{["']${escapedUrl}["']\\}`, 'g'),
          new RegExp(`src=\\{\\s*["']${escapedUrl}["']\\s*\\}`, 'g'),
          
          // URL in CloudinaryImage component
          new RegExp(`publicId=["']${escapedUrl}["']`, 'g'),
          
          // URL in JavaScript/TypeScript code
          new RegExp(`=${escapedUrl}`, 'g'),
          new RegExp(`\\(${escapedUrl}\\)`, 'g'),
          
          // URL in JSON
          new RegExp(`"url":\\s*"${escapedUrl}"`, 'g'),
          
          // URL in markdown
          new RegExp(`\\(${escapedUrl}\\)`, 'g'),
          
          // Just the raw URL (be careful with this one)
          new RegExp(escapedUrl, 'g')
        ];
        
        // Apply each pattern
        for (const pattern of patterns) {
          // For Image components, replace with CloudinaryImage
          if (pattern.toString().includes('src=') && 
              (filePath.endsWith('.jsx') || filePath.endsWith('.tsx'))) {
            
            // Check if this is an Image component
            const imageComponentRegex = new RegExp(`<Image[^>]*src=["']${escapedUrl}["'][^>]*>`, 'g');
            const matches = fileContent.match(imageComponentRegex);
            
            if (matches) {
              for (const match of matches) {
                // Extract alt, width, height from the Image component
                const altMatch = match.match(/alt=["']([^"']*)["']/);
                const widthMatch = match.match(/width=\{?(\d+)\}?/);
                const heightMatch = match.match(/height=\{?(\d+)\}?/);
                
                const alt = altMatch ? altMatch[1] : 'Image';
                const width = widthMatch ? widthMatch[1] : 800;
                const height = heightMatch ? heightMatch[1] : 600;
                
                // Create CloudinaryImage component
                const cloudinaryComponent = `<CloudinaryImage
  publicId="${cloudinaryInfo.publicId}"
  alt="${alt}"
  width={${width}}
  height={${height}}
  options={{
    crop: 'fill',
    gravity: 'center'
  }}
/>`;
                
                fileContent = fileContent.replace(match, cloudinaryComponent);
                fileReplacements++;
              }
            }
          } else if (pattern.toString().includes('src=')) {
            // For img tags
            const imgTagRegex = new RegExp(`<img[^>]*src=["']${escapedUrl}["'][^>]*>`, 'g');
            const matches = fileContent.match(imgTagRegex);
            
            if (matches) {
              for (const match of matches) {
                // Extract alt from the img tag
                const altMatch = match.match(/alt=["']([^"']*)["']/);
                const alt = altMatch ? altMatch[1] : 'Image';
                
                // Replace with img tag using Cloudinary URL
                const cloudinaryImgTag = `<img src="${cloudinaryInfo.url}" alt="${alt}" />`;
                
                fileContent = fileContent.replace(match, cloudinaryImgTag);
                fileReplacements++;
              }
            }
          } else {
            // For direct URL replacements
            const replacedContent = fileContent.replace(pattern, (match) => {
              fileReplacements++;
              
              // If it's a JSON file, we need to keep the structure
              if (filePath.endsWith('.json') && match.includes('"url":')) {
                return match.replace(vercelUrl, cloudinaryInfo.url);
              }
              
              // If it's in quotes, keep the quotes
              if (match.startsWith('"') && match.endsWith('"')) {
                return `"${cloudinaryInfo.url}"`;
              }
              if (match.startsWith("'") && match.endsWith("'")) {
                return `'${cloudinaryInfo.url}'`;
              }
              if (match.startsWith("`") && match.endsWith("`")) {
                return `\`${cloudinaryInfo.url}\``;
              }
              
              // Otherwise just return the URL
              return cloudinaryInfo.url;
            });
            
            if (replacedContent !== fileContent) {
              fileContent = replacedContent;
            }
          }
        }
      }
      
      // If the file was modified, write the changes
      if (fileContent !== originalContent) {
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`Updated file: ${filePath} (${fileReplacements} replacements)`);
        filesUpdated++;
        totalReplacements += fileReplacements;
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}: ${error.message}`);
    }
  }
  
  console.log(`Replacement summary: ${totalReplacements} URLs replaced in ${filesUpdated} files`);
}

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

// Main function
async function main() {
  try {
    console.log(chalk.blue.bold('Starting Vercel Blob to Cloudinary migration...'));
    
    // Create directories
    createDirectories();
    
    // Upload placeholder images
    await uploadPlaceholderImages();
    
    // Replace URLs in code
    await replaceUrlsInCode();
    
    console.log(chalk.green.bold('Migration completed successfully!'));
    console.log(chalk.yellow(`Next steps:
1. Review the code changes to ensure everything was replaced correctly
2. Test the application with Cloudinary images
3. Run the Vercel Blob URL scanner to verify all URLs were replaced:
   node scripts/find-vercel-blob-urls.js`));
    
  } catch (error) {
    console.error(chalk.red.bold('Migration failed:'), error);
    process.exit(1);
  }
}

// Run the main function
main(); 