import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { createClient } from '@supabase/supabase-js';
import { DIRECTORY_STRUCTURE } from '../lib/media/structure.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Asset type detection based on file extension
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv'];

/**
 * Scan directory for media files
 */
async function scanDirectory(dirPath) {
  const imageGlob = imageExtensions.map(ext => `${dirPath}/**/*${ext}`);
  const videoGlob = videoExtensions.map(ext => `${dirPath}/**/*${ext}`);
  
  const imageFiles = await glob(imageGlob);
  const videoFiles = await glob(videoGlob);
  
  return [...imageFiles, ...videoFiles];
}

/**
 * Group files by base name (without path or extension)
 */
function groupFilesByBaseName(files) {
  const groups = {};
  
  for (const file of files) {
    const fileName = path.basename(file);
    const baseName = path.basename(fileName, path.extname(fileName));
    
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    
    groups[baseName].push(file);
  }
  
  return groups;
}

/**
 * Find duplicate files in the file system
 */
async function findDuplicateFiles() {
  const allFiles = [];
  
  console.log('Scanning component assets...');
  // Scan component assets
  const componentDirs = Object.keys(DIRECTORY_STRUCTURE.components);
  for (const componentName of componentDirs) {
    const assetDir = `components/${componentName}/assets`;
    try {
      const files = await scanDirectory(assetDir);
      allFiles.push(...files);
    } catch (error) {
      // Directory might not exist, skip
    }
  }
  
  console.log('Scanning page assets...');
  // Scan page assets
  const pagesDir = 'public/images/pages';
  try {
    const pageDirs = await fs.promises.readdir(pagesDir, { withFileTypes: true });
    for (const dir of pageDirs) {
      if (dir.isDirectory()) {
        const pagePath = `${pagesDir}/${dir.name}`;
        const files = await scanDirectory(pagePath);
        allFiles.push(...files);
      }
    }
  } catch (error) {
    console.error('Error scanning page assets:', error);
  }
  
  console.log('Scanning global assets...');
  // Scan global assets
  const globalDir = 'public/images/global';
  try {
    const globalDirs = await fs.promises.readdir(globalDir, { withFileTypes: true });
    for (const dir of globalDirs) {
      if (dir.isDirectory()) {
        const dirPath = `${globalDir}/${dir.name}`;
        const files = await scanDirectory(dirPath);
        allFiles.push(...files);
      }
    }
  } catch (error) {
    console.error('Error scanning global assets:', error);
  }
  
  console.log('Scanning videos...');
  // Scan videos
  const videosDir = 'public/videos';
  try {
    const files = await scanDirectory(videosDir);
    allFiles.push(...files);
  } catch (error) {
    console.error('Error scanning videos:', error);
  }
  
  console.log(`\nTotal files scanned in file system: ${allFiles.length}`);
  
  // Group files by base name and find duplicates
  const groupedFiles = groupFilesByBaseName(allFiles);
  
  const duplicates = {};
  
  for (const [baseName, files] of Object.entries(groupedFiles)) {
    if (files.length > 1) {
      duplicates[baseName] = files;
    }
  }
  
  const duplicateCount = Object.keys(duplicates).length;
  console.log(`Found ${duplicateCount} potential duplicate file names in the file system`);
  
  return {
    allFiles,
    duplicates
  };
}

/**
 * Check for duplicate assets in the database
 */
async function checkDatabaseDuplicates() {
  console.log('\nChecking for duplicates in database tables...');
  
  const tables = [
    'media_assets',
    'images',
    'article_images',
    'team_members',
    'case_images'
  ];
  
  const duplicatesByTable = {};
  
  for (const table of tables) {
    try {
      // Check if table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', table)
        .single();
      
      if (tableError || !tableExists) {
        console.log(`Table ${table} does not exist, skipping...`);
        continue;
      }
      
      console.log(`Scanning table: ${table}`);
      
      // Generic approach to find duplicates based on URLs or image paths
      let query;
      
      if (table === 'media_assets') {
        // Check for duplicate public_ids in media_assets
        query = supabase.rpc('find_duplicate_media_assets');
      } else if (table === 'images') {
        // Check for duplicate URLs in images
        query = supabase.rpc('find_duplicate_images');
      } else if (table === 'article_images') {
        // Check for duplicate article images
        query = supabase.rpc('find_duplicate_article_images');
      } else if (table === 'team_members') {
        // Check for duplicate profile images
        query = supabase.rpc('find_duplicate_team_images');
      } else if (table === 'case_images') {
        // Check for duplicate case images
        query = supabase.rpc('find_duplicate_case_images');
      }
      
      if (!query) {
        // Fallback to a general query if no specific RPC is available
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) {
          console.error(`Error querying table ${table}:`, error);
          continue;
        }
        
        // Find fields that might contain image URLs or paths
        const imageFields = [];
        if (data.length > 0) {
          const row = data[0];
          for (const field in row) {
            const value = row[field];
            if (typeof value === 'string' && (
              field.includes('image') || 
              field.includes('url') || 
              field.includes('media') ||
              field.includes('photo') ||
              (value.includes('.jpg') || value.includes('.png') || value.includes('.webp'))
            )) {
              imageFields.push(field);
            }
          }
        }
        
        // Process the data to find duplicates in detected fields
        const fieldDuplicates = {};
        
        for (const field of imageFields) {
          const valueCount = {};
          
          for (const row of data) {
            const value = row[field];
            
            if (value) {
              if (!valueCount[value]) {
                valueCount[value] = {
                  count: 0,
                  rows: []
                };
              }
              
              valueCount[value].count++;
              valueCount[value].rows.push(row);
            }
          }
          
          // Extract only duplicates
          const duplicates = Object.entries(valueCount)
            .filter(([key, value]) => value.count > 1)
            .reduce((obj, [key, value]) => {
              obj[key] = value;
              return obj;
            }, {});
          
          if (Object.keys(duplicates).length > 0) {
            fieldDuplicates[field] = duplicates;
          }
        }
        
        if (Object.keys(fieldDuplicates).length > 0) {
          duplicatesByTable[table] = fieldDuplicates;
        }
      } else {
        // If we have a specific RPC function, use it
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error running RPC for table ${table}:`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          duplicatesByTable[table] = data;
        }
      }
    } catch (error) {
      console.error(`Error processing table ${table}:`, error);
    }
  }
  
  return duplicatesByTable;
}

/**
 * Main function
 */
async function main() {
  try {
    // Check file system for duplicates
    const { allFiles, duplicates } = await findDuplicateFiles();
    
    // Write duplicate results to a report file
    const fileSystemReport = {
      scannedAt: new Date().toISOString(),
      totalFilesScanned: allFiles.length,
      duplicateBasenameCount: Object.keys(duplicates).length,
      duplicates
    };
    
    await fs.promises.writeFile(
      'media-duplicate-filesystem-report.json',
      JSON.stringify(fileSystemReport, null, 2)
    );
    console.log('File system duplicates report written to media-duplicate-filesystem-report.json');
    
    // Check database for duplicates
    const databaseDuplicates = await checkDatabaseDuplicates();
    
    // Write database duplicates to a report file
    const databaseReport = {
      scannedAt: new Date().toISOString(),
      duplicatesByTable: databaseDuplicates
    };
    
    await fs.promises.writeFile(
      'media-duplicate-database-report.json',
      JSON.stringify(databaseReport, null, 2)
    );
    console.log('Database duplicates report written to media-duplicate-database-report.json');
    
    // Generate summary
    console.log('\n=== DUPLICATE MEDIA SCAN SUMMARY ===');
    console.log(`Total files scanned: ${allFiles.length}`);
    console.log(`File system duplicates: ${Object.keys(duplicates).length}`);
    
    const tableCount = Object.keys(databaseDuplicates).length;
    console.log(`Database tables with duplicates: ${tableCount}`);
    
    if (tableCount > 0) {
      console.log('\nDatabase duplicates by table:');
      for (const [table, dups] of Object.entries(databaseDuplicates)) {
        console.log(`- ${table}: ${Array.isArray(dups) ? dups.length : Object.keys(dups).length} duplicates`);
      }
    }
    
    console.log('\nReports have been written to:');
    console.log('- media-duplicate-filesystem-report.json');
    console.log('- media-duplicate-database-report.json');
    
  } catch (error) {
    console.error('Error scanning for duplicates:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 