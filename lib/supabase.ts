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
export interface Gallery {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Album {
  id: string;
  gallery_id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Case {
  id: string;
  album_id: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Image {
  id: string;
  case_id: string;
  cloudinary_url: string;
  caption: string;
  tags: string[];
  created_at: string;
  display_order: number;
}

export type TeamMember = {
  id: string;
  name: string;
  title?: string | null;
  role: string;
  image_url: string;
  description: string;
  order: number;
  is_provider: boolean;
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
export async function getGalleries() {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      handleSupabaseError(error, 'getGalleries');
      return [];
    }
    
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getGalleries');
    return [];
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

export async function getAlbumsByGallery(galleryIdOrTitle: string) {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    // First try to get albums by gallery ID
    let { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('gallery_id', galleryIdOrTitle)
      .order('created_at', { ascending: false });
    
    if (error) {
      handleSupabaseError(error, `getAlbumsByGallery(ID): ${galleryIdOrTitle}`);
      return [];
    }
    
    // If no albums found, try to get the gallery by title
    if (data && data.length === 0) {
      try {
        const gallery = await getGalleryByTitle(galleryIdOrTitle);
        
        if (!gallery) {
          console.error(`Gallery not found: ${galleryIdOrTitle}`);
          return [];
        }
        
        const result = await supabase
          .from('albums')
          .select('*')
          .eq('gallery_id', gallery.id)
          .order('created_at', { ascending: false });
        
        if (result.error) {
          handleSupabaseError(result.error, `getAlbumsByGallery(title): ${galleryIdOrTitle}`);
          return [];
        }
        
        data = result.data;
      } catch (err) {
        handleSupabaseError(err, `getAlbumsByGallery(title-fallback): ${galleryIdOrTitle}`);
        return [];
      }
    }
    
    return data || [];
  } catch (error) {
    handleSupabaseError(error, `getAlbumsByGallery: ${galleryIdOrTitle}`);
    return [];
  }
}

export async function getCasesByAlbum(albumId: string) {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('cases')
      .select('*, images(*)')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false });
    
    if (error) {
      handleSupabaseError(error, `getCasesByAlbum: ${albumId}`);
      return [];
    }
    
    return data || [];
  } catch (error) {
    handleSupabaseError(error, `getCasesByAlbum: ${albumId}`);
    return [];
  }
}

export async function getCase(caseId: string) {
  try {
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    const { data, error } = await supabase
      .from('cases')
      .select('*, images(*)')
      .eq('id', caseId)
      .single();
    
    if (error) {
      handleSupabaseError(error, `getCase: ${caseId}`);
      return null;
    }
    
    return data;
  } catch (error) {
    handleSupabaseError(error, `getCase: ${caseId}`);
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