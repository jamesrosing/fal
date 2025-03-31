import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase } from "@/lib/supabase"
import GalleryPage from "./page"
import { notFound } from "next/navigation"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


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
    const galleries = await getGalleries();
    return <GalleryPage galleries={galleries} />;
  }

  try {
    const galleries = await getGalleries();
    const albums = await getAlbumsByGallery(collectionId);
    
    if (!albums?.length) {
      notFound();
    }

    // If we have a case ID (UUID format), fetch case data
    if (caseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)) {
      const currentCase = await getCase(caseId);
      if (!currentCase) {
        notFound();
      }
      return <GalleryPage 
        galleries={galleries} 
        currentCase={currentCase}
      />;
    }

    // If we have an album ID, fetch cases for that album
    if (albumId) {
      const album = albums.find(a => 
        a.title.toLowerCase().replace(/\s+/g, '-') === albumId
      );
      if (!album) {
        notFound();
      }
      const cases = await getCasesByAlbum(album.id);
      return <GalleryPage 
        galleries={galleries} 
        cases={cases || []} 
        currentAlbum={album}
      />;
    }

    // If only collection ID, show albums
    return <GalleryPage galleries={galleries} albums={albums} />;

  } catch (error) {
    console.error('Error fetching data:', error);
    notFound();
  }
} 