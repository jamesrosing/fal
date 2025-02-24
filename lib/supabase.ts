import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'quote' | 'list';
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
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Gallery[];
}

export async function getGalleryByTitle(title: string) {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('title', title)
    .single();
  
  if (error) throw error;
  return data as Gallery;
}

export async function getAlbumsByGallery(galleryIdOrTitle: string) {
  // First try to get albums by gallery ID
  let { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('gallery_id', galleryIdOrTitle)
    .order('created_at', { ascending: false });
  
  if (error?.code === '22P02') { // Invalid UUID error
    // If gallery ID is invalid, try to get gallery by title first
    const gallery = await getGalleryByTitle(galleryIdOrTitle);
    if (!gallery) throw new Error('Gallery not found');
    
    const result = await supabase
      .from('albums')
      .select('*')
      .eq('gallery_id', gallery.id)
      .order('created_at', { ascending: false });
    
    if (result.error) throw result.error;
    data = result.data;
  } else if (error) {
    throw error;
  }
  
  return data as Album[];
}

export async function getCasesByAlbum(albumId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select('*, images(*)')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as (Case & { images: Image[] })[];
}

export async function getCase(caseId: string) {
  const { data, error } = await supabase
    .from('cases')
    .select('*, images(*)')
    .eq('id', caseId)
    .single();
  
  if (error) throw error;
  return data as Case & { images: Image[] };
} 