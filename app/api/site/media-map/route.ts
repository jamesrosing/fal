import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to the media map data file
const dataFilePath = path.join(process.cwd(), 'app/api/site/media-map/data.json');

/**
 * GET handler for media map API
 * Returns the media map data from the data.json file
 */
export async function GET() {
  try {
    // Check if the file exists
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json(
        { error: 'Media map not found. Run `npm run generate-media-map` to create it.' },
        { status: 404 }
      );
    }

    // Read and parse the data file
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const mediaMap = JSON.parse(rawData);

    // Return the media map as JSON
    return NextResponse.json(mediaMap);
  } catch (error) {
    console.error('Error serving media map:', error);
    return NextResponse.json(
      { error: 'Failed to load media map' },
      { status: 500 }
    );
  }
} 