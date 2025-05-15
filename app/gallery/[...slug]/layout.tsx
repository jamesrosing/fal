import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase } from "@/lib/supabase"
import GalleryPage from "./page"
import { notFound } from "next/navigation"

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

  // If no slug, show main gallery page
  if (!slugParams || slugParams.length === 0) {
    try {
      const galleries = await getGalleries();
      return <GalleryPage galleries={galleries} />;
    } catch (error) {
      console.error('Error fetching galleries:', error);
      return <GalleryPage galleries={[]} />;
    }
  }

  try {
    // Fetch all galleries
    const galleries = await getGalleries();
    
    if (!galleries || galleries.length === 0) {
      console.error('No galleries found');
      return <GalleryPage galleries={[]} />;
    }
    
    // Check if the requested collection exists
    const galleryExists = galleries.some(g => 
      g.id === collectionId || g.title.toLowerCase().replace(/\s+/g, '-') === collectionId
    );
    
    if (!galleryExists) {
      console.error(`Gallery not found: ${collectionId}`);
      notFound();
    }
    
    // Get albums for the requested gallery
    const albums = await getAlbumsByGallery(collectionId);
    
    if (!albums || albums.length === 0) {
      console.error(`No albums found for gallery: ${collectionId}`);
      return <GalleryPage galleries={galleries} albums={[]} />;
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
    // Return a basic gallery page with empty data instead of immediately showing 404
    return <GalleryPage galleries={[]} />;
  }
} 