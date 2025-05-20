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

export async function getAlbumsByGallery(gallerySlug: string): Promise<Album[] | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // First get all galleries to find the right one
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('id, title');
    
    if (galleriesError) {
      console.error('Error fetching galleries:', galleriesError);
      return null;
    }
    
    // Find gallery by exact title match or URL-friendly version of title
    const gallery = galleries.find(g => 
      g.title === gallerySlug || 
      g.title.toLowerCase().replace(/\s+/g, '-') === gallerySlug
    );
    
    if (!gallery) {
      console.error(`Gallery not found with title/slug: ${gallerySlug}`);
      return null;
    }
    
    // Get albums using the found gallery ID
    const { data, error } = await supabase
      .from('albums')
      .select(`
        *,
        case_count:cases(count),
        image_count:cases(images(count))
      `)
      .eq('gallery_id', gallery.id)
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    return data;
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
    if (!albumId.includes('-')) {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id')
        .eq('title', albumId)
        .single();
      
      if (albumError) {
        console.error('Error fetching album:', albumError);
        return null;
      }
      
      if (!album) {
        return null;
      }
      
      actualAlbumId = album.id;
    }
    
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        images (*)
      `)
      .eq('album_id', actualAlbumId)
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching cases by album:', error);
    return null;
  }
}

export async function getCase(caseId: string): Promise<Case | null> {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        images (*)
      `)
      .eq('id', caseId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching case:', error);
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