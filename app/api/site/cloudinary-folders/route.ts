import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary-server';

// Make the route work with Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define types for folder structure
interface CloudinaryFolder {
  name: string;
  path: string;
  subfolders: CloudinaryFolder[];
}

/**
 * GET handler for Cloudinary folders API
 * Returns the folder structure from Cloudinary
 */
export async function GET() {
  try {
    // Get all folders from Cloudinary
    const { folders } = await cloudinary.api.root_folders();
    
    // Create a map to store all folders and their subfolders
    const folderMap = new Map<string, CloudinaryFolder>();
    
    // Process root folders
    for (const folder of folders) {
      // Get subfolders for this folder
      const subfolders = await getSubfolders(folder.path);
      
      // Add to map
      folderMap.set(folder.path, {
        name: folder.name,
        path: folder.path,
        subfolders
      });
    }
    
    // Convert map to array for response
    const folderStructure = Array.from(folderMap.values());
    
    return NextResponse.json(folderStructure);
  } catch (error) {
    console.error('Error fetching Cloudinary folders:', error);
    return NextResponse.json(
      { error: 'Failed to load Cloudinary folders' },
      { status: 500 }
    );
  }
}

/**
 * Recursively get subfolders for a given folder path
 */
async function getSubfolders(folderPath: string): Promise<CloudinaryFolder[]> {
  try {
    const { folders } = await cloudinary.api.sub_folders(folderPath);
    
    // Process each subfolder
    const result: CloudinaryFolder[] = [];
    
    for (const folder of folders) {
      // Get subfolders for this folder
      const subfolders: CloudinaryFolder[] = await getSubfolders(folder.path);
      
      // Add to result
      result.push({
        name: folder.name,
        path: folder.path,
        subfolders
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error fetching subfolders for ${folderPath}:`, error);
    return [];
  }
} 