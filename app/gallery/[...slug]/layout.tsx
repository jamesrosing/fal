import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase } from "@/lib/supabase"
import GalleryPage from "./page"
import { notFound } from "next/navigation"
import { createClient } from '@supabase/supabase-js'

// Fallback data for when the database is empty or unavailable
const FALLBACK_GALLERIES = [
  {
    id: "plastic-surgery",
    title: "Plastic Surgery",
    description: "Before and after examples of various plastic surgery procedures.",
    created_at: new Date().toISOString()
  },
  {
    id: "dermatology",
    title: "Dermatology",
    description: "Skin treatments and dermatological procedures.",
    created_at: new Date().toISOString()
  },
  {
    id: "medical-spa",
    title: "Medical Spa",
    description: "Non-surgical cosmetic treatments for face and body.",
    created_at: new Date().toISOString()
  }
];

// Create a fallback Supabase client for error handling
const createFallbackClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set');
    return null;
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

interface LayoutProps {
  children: React.ReactNode;
  params: {
    slug: string[];
  };
}

export default async function GalleryLayout({ children, params }: LayoutProps) {
  // Make sure params.slug is properly awaited before using it
  const slugParams = await Promise.resolve(params.slug || []);
  const [collectionId, albumId, caseId] = slugParams;

  // Function to safely fetch galleries with fallback
  async function safeGetGalleries() {
    try {
      return await getGalleries();
    } catch (error) {
      console.error('Error fetching galleries:', error);
      
      // Try with fallback client
      const fallbackClient = createFallbackClient();
      if (fallbackClient) {
        try {
          const { data } = await fallbackClient
            .from('galleries')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (data && data.length > 0) {
            return data;
          }
        } catch (fallbackError) {
          console.error('Fallback gallery fetch failed:', fallbackError);
        }
      }
      
      // If all else fails, return mock data
      console.log('Using fallback gallery data');
      return FALLBACK_GALLERIES;
    }
  }

  // If no slug, show main gallery page
  if (!slugParams || slugParams.length === 0) {
    const galleries = await safeGetGalleries();
    return <GalleryPage galleries={galleries.length > 0 ? galleries : FALLBACK_GALLERIES} />;
  }

  try {
    // Fetch all galleries
    const galleries = await safeGetGalleries();
    
    if (!galleries || galleries.length === 0) {
      console.error('No galleries found');
      return <GalleryPage galleries={FALLBACK_GALLERIES} />;
    }
    
    // Check if the requested collection exists
    const galleryExists = galleries.some(g => 
      g.id === collectionId || g.title.toLowerCase().replace(/\s+/g, '-') === collectionId
    );
    
    if (!galleryExists) {
      console.error(`Gallery not found: ${collectionId}`);
      notFound();
    }
    
    // Get albums for the requested gallery - with safety wrapper
    let albums = [];
    try {
      albums = await getAlbumsByGallery(collectionId);
    } catch (albumError) {
      console.error(`Error fetching albums for gallery ${collectionId}:`, albumError);
      // Continue with empty albums array
    }
    
    // If we have a case ID (UUID format), fetch case data
    if (caseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)) {
      try {
        const currentCase = await getCase(caseId);
        if (!currentCase) {
          console.error(`Case not found: ${caseId}`);
          notFound();
        }
        return <GalleryPage 
          galleries={galleries} 
          currentCase={currentCase}
        />;
      } catch (caseError) {
        console.error(`Error fetching case ${caseId}:`, caseError);
        notFound();
      }
    }

    // If we have an album ID, fetch cases for that album
    if (albumId) {
      const album = albums.find(a => 
        a.title.toLowerCase().replace(/\s+/g, '-') === albumId
      );
      
      if (!album) {
        console.error(`Album not found: ${albumId}`);
        notFound();
      }
      
      try {
        const cases = await getCasesByAlbum(album.id);
        return <GalleryPage 
          galleries={galleries} 
          cases={cases || []} 
          currentAlbum={album}
        />;
      } catch (casesError) {
        console.error(`Error fetching cases for album ${album.id}:`, casesError);
        return <GalleryPage 
          galleries={galleries} 
          cases={[]} 
          currentAlbum={album}
        />;
      }
    }

    // If only collection ID, show albums
    return <GalleryPage galleries={galleries} albums={albums} />;

  } catch (error) {
    console.error('Error fetching data:', error);
    // Return a basic gallery page with fallback data instead of immediately showing 404
    return <GalleryPage galleries={FALLBACK_GALLERIES} />;
  }
} 