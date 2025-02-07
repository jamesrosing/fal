import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase } from "@/lib/supabase"
import GalleryPage from "./page"
import { notFound } from "next/navigation"

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}

export default async function GalleryLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;

  if (!resolvedParams.slug || resolvedParams.slug.length === 0) {
    const galleries = await getGalleries()
    return <GalleryPage galleries={galleries} />
  }

  try {
    const galleries = await getGalleries()
    const slug = resolvedParams.slug

    console.log('Processing gallery URL:', {
      slug,
      path: slug.join('/')
    });

    // If viewing a gallery collection
    if (slug.length === 1) {
      const galleryId = slug[0]
      console.log('Fetching albums for gallery:', galleryId);
      const albums = await getAlbumsByGallery(galleryId)
      if (!albums) {
        console.error(`No albums found for gallery: ${galleryId}`)
        notFound()
      }
      return <GalleryPage galleries={galleries} albums={albums} />
    }

    // For URLs with 2 segments (e.g., /plastic-surgery/face or /plastic-surgery/<uuid>)
    if (slug.length === 2) {
      const [galleryId, secondSegment] = slug
      console.log('Processing two-segment URL:', { galleryId, secondSegment });

      // First check if it's a UUID (case)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secondSegment)) {
        console.log('Detected UUID format, fetching case:', secondSegment);
        try {
          const currentCase = await getCase(secondSegment)
          if (currentCase?.images?.length > 0) {
            return <GalleryPage galleries={galleries} currentCase={currentCase} />
          }
        } catch (error) {
          console.error('Error fetching case:', error);
        }
      }

      // If not a UUID or case not found, try to find album by title
      try {
        console.log('Fetching albums to match with slug:', secondSegment);
        const albums = await getAlbumsByGallery(galleryId)
        if (albums) {
          // Find the album that matches the slug
          const matchingAlbum = albums.find(album => {
            const normalizedAlbumTitle = album.title.toLowerCase().replace(/\s+/g, '-');
            const normalizedSlug = secondSegment.toLowerCase();
            console.log('Comparing:', { 
              albumTitle: normalizedAlbumTitle, 
              slug: normalizedSlug,
              matches: normalizedAlbumTitle === normalizedSlug
            });
            return normalizedAlbumTitle === normalizedSlug;
          });
          
          if (matchingAlbum) {
            console.log('Found matching album:', matchingAlbum);
            const cases = await getCasesByAlbum(matchingAlbum.id)
            return <GalleryPage 
              galleries={galleries} 
              cases={cases || []} 
              currentAlbum={matchingAlbum}
            />
          }
        }
      } catch (error) {
        console.error(`Error fetching album for ${galleryId}/${secondSegment}:`, error)
      }
    }

    // If we get here, the URL structure is invalid or content wasn't found
    console.log(`No matching content found for URL: ${slug.join('/')}`)
    notFound()
  } catch (error) {
    // Log the full error object for debugging
    console.error('Error in gallery layout:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: resolvedParams.slug
    })
    
    throw error // Let Next.js error boundary handle it
  }
} 