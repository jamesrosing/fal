import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Client
 * 
 * This module provides functions to create Supabase clients
 * for interacting with the Supabase database from both client and server components.
 */

// Create a Supabase client for client components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Create a Supabase client for server components and API routes
export function createServerClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set');
    throw new Error('Supabase environment variables are missing');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// For better naming in client components
export const createClientComponentClient = createClient

// Helper function to check if a user is authenticated and has admin privileges
export async function isUserAdmin() {
  const supabase = createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) return false
    
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    return data && ['admin', 'super_admin'].includes(data.role)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Types for our database tables
export type Gallery = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  image_count?: number;
  album_count?: number;
  case_count?: number;
};

export type Album = {
  id: string;
  title: string;
  description?: string;
  gallery_id: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  procedure?: string;
  image_count?: number;
  case_count?: number;
};

export type Case = {
  id: string;
  title: string;
  description?: string;
  procedure?: string;
  album_id: string;
  created_at: string;
  updated_at?: string;
  slug?: string;
  patient_age?: number;
  patient_gender?: string;
  before_date?: string;
  after_date?: string;
  images?: Image[];
  metadata?: Record<string, any>;
};

export type Image = {
  id: string;
  case_id: string;
  cloudinary_id: string;
  cloudinary_url: string;
  type: string;
  sort_order: number;
  is_before: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  title?: string | null;
  role: string;
  image_url: string;
  description: string;
  order: number;
  is_provider: string;
  created_at: string;
  updated_at: string;
};

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: ArticleContent[];
  excerpt: string;
  author_id: string;
  category_id: string;
  subcategory?: string;
  is_draft: boolean; // Changed from 'status' to match database schema
  featured_image?: string;
  featured_video?: string;
  meta_description?: string;
  meta_keywords?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  tags?: string[];
}

export interface ArticleContent {
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'quote' | 'list' | 'callout';
  content: string;
  metadata?: Record<string, any>;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order_position: number;
  created_at: string;
  updated_at: string;
}

// Utility for handling various error types safely
function handleSupabaseError(error: any, operation: string): void {
  if (!error) return;
  
  let errorMessage = 'Unknown error';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.error) {
    errorMessage = error.error;
  }
  
  console.error(`Error during ${operation}:`, errorMessage);
  console.error('Full error:', JSON.stringify(error, null, 2));
}

// Helper functions for database operations
export async function getGalleries(): Promise<Gallery[] | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('galleries')
      .select(`
        *,
        album_count:albums(count),
        case_count:albums(cases(count)),
        image_count:albums(cases(images(count)))
      `)
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return null;
  }
}

export async function getGalleryByTitle(title: string) {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('title', title)
      .single();
    
    if (error) {
      handleSupabaseError(error, `getGalleryByTitle: ${title}`);
      return null;
    }
    
    return data;
  } catch (error) {
    handleSupabaseError(error, `getGalleryByTitle: ${title}`);
    return null;
  }
}

export async function getAlbumsByGallery(gallerySlugOrId: string): Promise<Album[] | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // First check if gallerySlugOrId is a UUID
    if (gallerySlugOrId.includes('-') && gallerySlugOrId.length > 20) {
      // If it looks like a UUID, use it directly as gallery_id
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          case_count:cases(count),
          image_count:cases(images(count))
        `)
        .eq('gallery_id', gallerySlugOrId)
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data;
    } 
    
    // If not a UUID, try to find the gallery by title with more flexible matching
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('id, title');
    
    if (galleriesError) {
      console.error('Error fetching galleries:', galleriesError);
      return null;
    }
    
    // Normalize the input slug for comparison
    const normalizedSlug = gallerySlugOrId.toLowerCase().trim();
    const dashedSlug = normalizedSlug.replace(/\s+/g, '-');
    
    // Find gallery with flexible matching (exact title, lowercase title, or URL-friendly)
    const foundGallery = galleries?.find(g => 
      g.title.toLowerCase() === normalizedSlug || 
      g.title.toLowerCase().replace(/\s+/g, '-') === normalizedSlug || 
      g.title.toLowerCase().replace(/\s+/g, '-') === dashedSlug
    );
    
    if (!foundGallery) {
      console.error(`Gallery not found with title/slug: ${gallerySlugOrId}`);
      return null;
    }
    
    // Get albums using the found gallery ID
    const { data: albumsData, error: albumsError } = await supabase
      .from('albums')
      .select(`
        *,
        case_count:cases(count),
        image_count:cases(images(count))
      `)
      .eq('gallery_id', foundGallery.id)
      .order('title', { ascending: true });
    
    if (albumsError) {
      console.error('Error fetching albums:', albumsError);
      return null;
    }
    
    return albumsData;
    
  } catch (error) {
    console.error('Error fetching albums by gallery:', error);
    return null;
  }
}

export async function getCasesByAlbum(albumId: string): Promise<Case[] | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // Handle if albumId is actually a slug (title instead of UUID)
    let actualAlbumId = albumId;
    
    // Check if albumId is not a UUID
    if (!albumId.includes('-') || albumId.length < 20) {
      // Try to find the album with more robust matching logic
      const { data: albums, error: albumsError } = await supabase
        .from('albums')
        .select('id, title');
        
      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
        return null;
      }
      
      // Normalize the input slug for comparison
      const normalizedInput = albumId.toLowerCase().replace(/-/g, ' ');
      
      // Find a matching album - try exact match first, then normalized
      const matchingAlbum = albums?.find(
        album => album.title.toLowerCase() === albumId.toLowerCase() || 
                 album.title.toLowerCase() === normalizedInput || 
                 album.title.toLowerCase().replace(/\s+/g, '-') === albumId.toLowerCase()
      );
      
      if (!matchingAlbum) {
        return null;
      }
      
      actualAlbumId = matchingAlbum.id;
    }
    
    // Fetch the cases
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .eq('album_id', actualAlbumId)
      .order('title');
    
    if (error) {
      console.error('Error fetching cases:', error);
      return null;
    }
    
    if (!cases || cases.length === 0) {
      return [];
    }
    
    // For each case, fetch its images from case_images and media_assets
    const casesWithImages = await Promise.all(cases.map(async (caseItem) => {
      // Get case_images for this case
      const { data: caseImages, error: caseImagesError } = await supabase
        .from('case_images')
        .select('media_id, sequence')
        .eq('case_id', caseItem.id)
        .order('sequence', { ascending: true });
      
      if (caseImagesError) {
        console.error(`Error fetching case_images for case ${caseItem.id}:`, caseImagesError);
        return { ...caseItem, images: [] };
      }
      
      if (!caseImages || caseImages.length === 0) {
        return { ...caseItem, images: [] };
      }
      
      // Get media_assets for these case_images
      const mediaIds = caseImages.map(ci => ci.media_id);
      const { data: mediaAssets, error: mediaAssetsError } = await supabase
        .from('media_assets')
        .select('*')
        .in('id', mediaIds);
      
      if (mediaAssetsError) {
        console.error(`Error fetching media_assets for case ${caseItem.id}:`, mediaAssetsError);
        return { ...caseItem, images: [] };
      }
      
      // Map media assets to our expected image format
      // Sort by the sequence from case_images
      const images = caseImages.map(ci => {
        const media = mediaAssets?.find(ma => ma.id === ci.media_id);
        if (!media) return null;
        
        return {
          id: media.id,
          case_id: caseItem.id,
          cloudinary_id: media.cloudinary_id || '',
          cloudinary_url: media.url || '',
          type: media.type || 'image',
          sort_order: ci.sequence || 0,
          is_before: media.tags?.includes('before') || false,
          created_at: media.created_at || '',
          updated_at: media.updated_at || ''
        };
      }).filter(Boolean) as Image[];
      
      return {
        ...caseItem,
        images: images || []
      };
    }));
    
    return casesWithImages as Case[];
    
  } catch (error) {
    console.error('Error in getCasesByAlbum:', error);
    return null;
  }
}

export async function getCase(caseId: string): Promise<Case | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // Fetch the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();
    
    if (caseError) {
      console.error(`Error fetching case ${caseId}:`, caseError);
      return null;
    }
    
    if (!caseData) {
      return null;
    }
    
    // Get case_images for this case
    const { data: caseImages, error: caseImagesError } = await supabase
      .from('case_images')
      .select('media_id, sequence')
      .eq('case_id', caseId)
      .order('sequence', { ascending: true });
    
    if (caseImagesError) {
      console.error(`Error fetching case_images for case ${caseId}:`, caseImagesError);
      return { ...caseData, images: [] };
    }
    
    if (!caseImages || caseImages.length === 0) {
      return { ...caseData, images: [] };
    }
    
    // Get media_assets for these case_images
    const mediaIds = caseImages.map(ci => ci.media_id);
    const { data: mediaAssets, error: mediaAssetsError } = await supabase
      .from('media_assets')
      .select('*')
      .in('id', mediaIds);
    
    if (mediaAssetsError) {
      console.error(`Error fetching media_assets for case ${caseId}:`, mediaAssetsError);
      return { ...caseData, images: [] };
    }
    
    // Map media assets to our expected image format
    // Sort by the sequence from case_images
    const images = caseImages.map(ci => {
      const media = mediaAssets?.find(ma => ma.id === ci.media_id);
      if (!media) return null;
      
      return {
        id: media.id,
        case_id: caseId,
        cloudinary_id: media.cloudinary_id || '',
        cloudinary_url: media.url || '',
        type: media.type || 'image',
        sort_order: ci.sequence || 0,
        is_before: media.tags?.includes('before') || false,
        created_at: media.created_at || '',
        updated_at: media.updated_at || ''
      };
    }).filter(Boolean) as Image[];
    
    return {
      ...caseData,
      images: images || []
    };
    
  } catch (error) {
    console.error('Error in getCase:', error);
    return null;
  }
}

export async function getCaseById(caseId: string) {
  return getCase(caseId);
}

function compareByDate(a: any, b: any) {
  // comparison function code
}

function compareByRelevance(a: any, b: any) {
  // comparison function code
}

// Get a specific gallery by slug
export async function getGallery(slug: string): Promise<Gallery | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching gallery:', error);
    return null;
  }
  
  return data as Gallery;
}

// Get a specific album by slug
export async function getAlbum(slug: string): Promise<Album | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching album:', error);
    return null;
  }
  
  return data as Album;
} 