import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import mediaRegistry from '@/lib/media/registry';
import { mediaService } from '@/lib/services/media-service';

/**
 * GET handler for retrieving media by placeholder ID
 * 
 * This API route serves as a connector between placeholder IDs and actual media assets.
 * It first checks the database for any mapping, then falls back to the registry.
 * 
 * @route GET /api/media/[placeholderId]
 */

// Default mappings for fallback when database lookup fails
const FALLBACK_MAPPINGS: Record<string, string> = {
  // Team provider mappings - adding the missing ones that caused 404 errors
  'team-provider-rosing': 'team/providers/rosing',
  'team-provider-pearose': 'team/providers/pearose',
  'team-provider-julia': 'team/providers/julia',
  'team-provider-gidwani': 'team/providers/gidwani',
  
  // Common fallbacks for other sections
  'homepage-hero': 'homepage/hero',
  'homepage-team-background': 'homepage/team-section-background',
  'about-hero': 'about/hero-image',
  'contact-hero': 'contact/hero-image',
  'services-hero': 'services/hero-image',
};

// Helper function to get media asset by placeholder ID
async function getMediaByPlaceholderId(placeholderId: string) {
  const supabase = createClient();
  
  try {
    // First check if there's a mapping in the media_mappings table
    const { data: mapping, error: mappingError } = await supabase
      .from('media_mappings')
      .select('media_id')
      .eq('placeholder_id', placeholderId)
      .single();
    
    if (mappingError || !mapping) {
      return null;
    }
    
    // If mapping found, get the media asset
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', mapping.media_id)
      .single();
    
    if (assetError || !asset) {
      return null;
    }
    
    return asset;
  } catch (error) {
    console.error(`Error querying database for placeholder ID ${placeholderId}:`, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { placeholderId: string } }
) {
  // Get the parameters in a Next.js 13+ compatible way
  const placeholderId = context.params.placeholderId;
  
  if (!placeholderId) {
    return NextResponse.json(
      { error: 'Missing placeholderId parameter' },
      { status: 400 }
    );
  }

  try {
    // Try to find the media asset in the database
    const mediaAsset = await getMediaByPlaceholderId(placeholderId);
    
    if (mediaAsset) {
      return NextResponse.json(mediaAsset);
    }
    
    // If not found in database, check our fallback mappings
    if (FALLBACK_MAPPINGS[placeholderId]) {
      // Return a constructed asset object using the fallback mapping
      console.log(`Using fallback mapping for placeholder: ${placeholderId} -> ${FALLBACK_MAPPINGS[placeholderId]}`);
      return NextResponse.json({
        id: `fallback-${placeholderId}`,
        placeholder_id: placeholderId,
        public_id: FALLBACK_MAPPINGS[placeholderId],
        type: 'image',
        created_at: new Date().toISOString(),
      });
    }

    // If we get here, the placeholder ID wasn't found anywhere
    console.log(`No media asset found for placeholderId: ${placeholderId}`);
    return NextResponse.json(
      { error: `No media asset found for placeholderId: ${placeholderId}` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`Error fetching media asset for placeholderId ${placeholderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch media asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { placeholderId: string } }
) {
  // Get the parameters in a Next.js 13+ compatible way
  const placeholderId = context.params.placeholderId;
  
  if (!placeholderId) {
    return NextResponse.json(
      { error: 'Missing placeholderId parameter' },
      { status: 400 }
    );
  }
  
  try {
    const supabase = createClient();
    
    // Delete the media asset from the media_assets table
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('placeholder_id', placeholderId);
    
    if (error) {
      console.error('Error deleting media asset:', error);
      return NextResponse.json(
        { error: `Failed to delete media asset: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete media asset' },
      { status: 500 }
    );
  }
} 