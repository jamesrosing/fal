import { createBrowserClient } from '@supabase/ssr'
import { createClient as createServerClientBase } from '@supabase/supabase-js'

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

// Create a Supabase client for server components
export function createServerClient() {
  return createServerClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  display_order?: number;
}

export interface Album {
  id: string;
  gallery_id: string;
  title: string;
  description: string;
  created_at: string;
  display_order?: number;
}

export interface Case {
  id: string;
  album_id: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  display_order?: number;
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
  title?: string;
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
  status: 'draft' | 'published' | 'archived';
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

// Helper functions for database operations
export async function getGalleries() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
  return data || [];
}

export async function getGalleryByTitle(title: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('title', title)
    .single();
  
  if (error) {
    console.error('Error fetching gallery by title:', error);
    throw error;
  }
  return data;
}

export async function getAlbumsByGallery(galleryIdOrTitle: string) {
  const supabase = createServerClient();
  // First try to get albums by gallery ID
  let { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('gallery_id', galleryIdOrTitle)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching albums by gallery ID:', error);
    throw error;
  }
  
  // If no albums found, try to get the gallery by title
  if (data && data.length === 0) {
    try {
      const gallery = await getGalleryByTitle(galleryIdOrTitle);
      
      if (!gallery) throw new Error('Gallery not found');
      
      const result = await supabase
        .from('albums')
        .select('*')
        .eq('gallery_id', gallery.id)
        .order('display_order', { ascending: true });
      
      if (result.error) throw result.error;
      data = result.data;
    } catch (err) {
      console.error('Error fetching albums by gallery title:', err);
      return [];
    }
  }
  
  return data || [];
}

export async function getCasesByAlbum(albumId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('cases')
    .select('*, images(*)')
    .eq('album_id', albumId)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching cases by album:', error);
    throw error;
  }
  return data || [];
}

export async function getCase(caseId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('cases')
    .select('*, images(*)')
    .eq('id', caseId)
    .single();
  
  if (error) {
    console.error('Error fetching case:', error);
    throw error;
  }
  return data;
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