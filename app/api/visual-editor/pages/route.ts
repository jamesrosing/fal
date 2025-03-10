import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Define interfaces for our data structures
interface MediaPlaceholder {
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
  media_type?: 'image' | 'video';
}

interface MediaAsset {
  placeholder_id: string;
  cloudinary_id: string;
  uploaded_at: string;
  uploaded_by: string;
  metadata: Record<string, any>;
}

interface MediaPosition {
  id: string;
  name: string;
  description: string;
  section: string;
  page: string;
  currentImage?: string;
  mediaType?: 'image' | 'video';
}

interface PagePreview {
  id: string;
  name: string;
  path: string;
  preview: string;
  mediaPositions: MediaPosition[];
}

interface PageGroups {
  [key: string]: PagePreview;
}

// API route that fetches page data from the database
export async function GET() {
  try {
    const supabase = createClient();
    
    // 1. Fetch all media placeholders
    const { data: placeholders, error: placeholdersError } = await supabase
      .from('media_placeholders')
      .select('*')
      .order('id');
    
    if (placeholdersError) {
      console.error('Error fetching media placeholders:', placeholdersError);
      return NextResponse.json(
        { error: 'Failed to fetch media placeholders' },
        { status: 500 }
      );
    }
    
    // 2. Fetch all media assets to get the current images
    const { data: assets, error: assetsError } = await supabase
      .from('media_assets')
      .select('*');
    
    if (assetsError) {
      console.error('Error fetching media assets:', assetsError);
      return NextResponse.json(
        { error: 'Failed to fetch media assets' },
        { status: 500 }
      );
    }
    
    // 3. Create a map of placeholder IDs to cloudinary IDs
    const assetMap = new Map<string, string>();
    (assets as MediaAsset[]).forEach(asset => {
      assetMap.set(asset.placeholder_id, asset.cloudinary_id);
    });
    
    // 4. Group placeholders by page path
    const pageGroups: PageGroups = {};
    (placeholders as MediaPlaceholder[]).forEach(placeholder => {
      const pagePath = placeholder.path;
      
      if (!pageGroups[pagePath]) {
        pageGroups[pagePath] = {
          id: pagePath,
          name: formatPageName(pagePath),
          path: `/${pagePath === 'home' ? '' : pagePath}`,
          preview: `/placeholder-image.jpg`,
          mediaPositions: []
        };
      }
      
      // Determine media type from placeholder data
      const mediaType = placeholder.media_type || 'image';
      
      // Add the placeholder to the page's mediaPositions array
      pageGroups[pagePath].mediaPositions.push({
        id: placeholder.id,
        name: placeholder.name,
        description: placeholder.description,
        section: placeholder.area,
        page: placeholder.path,
        mediaType: mediaType,
        currentImage: assetMap.get(placeholder.id) || undefined
      });
    });
    
    // 5. Convert the pageGroups object to an array
    const pages = Object.values(pageGroups);
    
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching page data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    );
  }
}

// Helper function to format page name (e.g., "home" -> "Home Page")
function formatPageName(path: string): string {
  const nameMappings: Record<string, string> = {
    'home': 'Home Page',
    'services': 'Services Page',
    'about': 'About Us',
    'contact': 'Contact Page'
  };
  
  return nameMappings[path] || path.charAt(0).toUpperCase() + path.slice(1);
} 