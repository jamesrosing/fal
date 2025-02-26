import { NextResponse } from 'next/server';

// Keep Edge runtime
export const runtime = 'edge';

export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }
    
    // Authentication method for Cloudinary API
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    // Fetch root folders
    const foldersUrl = `https://api.cloudinary.com/v1_1/${cloudName}/folders`;
    const foldersResponse = await fetch(foldersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!foldersResponse.ok) {
      throw new Error(`Failed to fetch folders: ${foldersResponse.status}`);
    }
    
    const foldersResult = await foldersResponse.json();
    const allFolders = foldersResult.folders.map((folder: any) => folder.path);
    
    // Fetch tags
    const tagsUrl = `https://api.cloudinary.com/v1_1/${cloudName}/tags/image`;
    const tagsResponse = await fetch(tagsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!tagsResponse.ok) {
      throw new Error(`Failed to fetch tags: ${tagsResponse.status}`);
    }
    
    const tagsResult = await tagsResponse.json();
    const tags = tagsResult.tags || [];
    
    return NextResponse.json({
      folders: allFolders,
      tags
    });
  } catch (error) {
    console.error('Error fetching Cloudinary organizers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizers from Cloudinary' },
      { status: 500 }
    );
  }
} 