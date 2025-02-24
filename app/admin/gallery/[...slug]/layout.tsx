import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import GalleryPage from "./page"

interface LayoutProps {
  children: React.ReactNode;
  params: {
    slug: string[];
  };
}

export default async function GalleryLayout({ children, params }: LayoutProps) {
  const [collectionId, albumId, caseId] = params.slug || [];

  // If no slug, show main gallery page
  if (!params.slug || params.slug.length === 0) {
    const galleries = await getGalleries();
    return <GalleryPage />;
  }

  try {
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
      return <GalleryPage />;
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
      return <GalleryPage />;
    }

    // If only collection ID, show albums
    return <GalleryPage />;

  } catch (error) {
    console.error('Error fetching data:', error);
    notFound();
  }
} 