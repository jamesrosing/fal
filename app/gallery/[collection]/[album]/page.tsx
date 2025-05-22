import { getGalleries, getAlbumsByGallery, getCasesByAlbum, Image as GalleryImage } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from '@/components/shared/layout/nav-bar';
import CldImage from '@/components/shared/media/CldImage';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/shared/ui/breadcrumb';
import { GallerySidebar } from '@/components/features/gallery/GallerySidebar';

interface AlbumPageProps {
  params: {
    collection: string;
    album: string;
  },
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AlbumPage({ params, searchParams }: AlbumPageProps) {
  // Fetch all galleries to verify collection exists
  const galleries = await getGalleries();
  
  if (!galleries || galleries.length === 0) {
    notFound();
  }
  
  // Find current gallery by slug (collection param)
  const currentGallery = galleries.find(
    gallery => gallery.title.toLowerCase() === params.collection.toLowerCase() || 
               gallery.title.toLowerCase().replace(/\s+/g, '-') === params.collection.toLowerCase()
  );
  
  if (!currentGallery) {
    notFound();
  }
  
  // Get albums for this gallery
  const albums = await getAlbumsByGallery(params.collection);
  
  if (!albums || albums.length === 0) {
    notFound();
  }
  
  // Find current album by slug
  const currentAlbum = albums.find(
    album => album.title.toLowerCase() === params.album.toLowerCase() || 
             album.title.toLowerCase().replace(/\s+/g, '-') === params.album.toLowerCase()
  );
  
  if (!currentAlbum) {
    notFound();
  }
  
  // Get cases for this album
  const cases = await getCasesByAlbum(currentAlbum.id);
  
  // Sort cases by extracting the number from the title (e.g. "Case 1" -> 1)
  const sortedCases = [...(cases || [])].sort((a, b) => {
    const aNum = parseInt(a.title.replace(/[^0-9]/g, '')) || 0;
    const bNum = parseInt(b.title.replace(/[^0-9]/g, '')) || 0;
    return aNum - bNum;
  });
  
  // Get filter values from search params
  const selectedProcedure = searchParams?.procedure as string | undefined;
  const sortParam = searchParams?.sort as string | undefined;
  
  // Extract unique procedures for the sidebar
  const procedures = Array.from(
    new Set(
      sortedCases.flatMap(c => c.procedure ? [c.procedure] : [])
        .filter(Boolean)
    )
  ).map(proc => ({
    id: proc,
    label: proc,
    count: sortedCases.filter(c => c.procedure === proc).length
  }));
  
  // Fetch all albums for each gallery for the sidebar
  const sidebarCollections = await Promise.all(
    galleries.map(async (gallery) => {
      const galleryAlbums = await getAlbumsByGallery(gallery.id);
      return {
        id: gallery.title.toLowerCase().replace(/\s+/g, '-'),
        title: gallery.title,
        albums: galleryAlbums?.map(album => ({
          id: album.title.toLowerCase().replace(/\s+/g, '-'),
          title: album.title,
        })) || []
      };
    })
  );
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      {/* Hero Section */}
      <div className="w-full pt-16">
        <div className="relative w-full aspect-video md:aspect-auto md:h-[40vh]">
          <CldImage
            src={`gallery/${params.collection}/${params.album}/hero`}
            alt={`${currentAlbum.title} Album`}
            fill
            priority
            className="w-full h-full object-cover"
            fallbackSrc={`/placeholder.svg?height=400&width=800&text=${encodeURIComponent(currentAlbum.title)}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
          
          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-6xl">
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">{currentGallery.title}</h1>
              <h2 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-tight font-serif text-white">
                {currentAlbum.title}
              </h2>
              {currentAlbum.description && (
                <div className="space-y-4 text-base font-cerebri font-light">
                  <p className="text-white/90 max-w-3xl">
                    {currentAlbum.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cases Section */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/gallery">Gallery</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/gallery/${params.collection}`}>
                {currentGallery.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentAlbum.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <GallerySidebar
              title={currentAlbum.title}
              procedures={procedures}
              sortOptions={[
                { id: 'newest', label: 'Newest', count: sortedCases.length },
                { id: 'oldest', label: 'Oldest', count: sortedCases.length },
                { id: 'az', label: 'A-Z', count: sortedCases.length },
                { id: 'za', label: 'Z-A', count: sortedCases.length },
              ]}
              baseUrl={`/gallery/${params.collection}/${params.album}`}
              selectedProcedure={selectedProcedure}
              selectedSort={sortParam}
              collections={sidebarCollections}
              currentCollection={params.collection}
              currentAlbum={params.album}
            />
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif">
                {sortedCases.length > 0 ? `${sortedCases.length} Cases` : 'No Cases Yet'}
              </h3>
            </div>
            
            {sortedCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCases.map((case_) => (
                  <Link
                    key={case_.id}
                    href={`/gallery/${params.collection}/${params.album}/${case_.id}`}
                    className="group block"
                  >
                    <div className="bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                      {case_.images && case_.images[0] ? (
                        <div className="relative w-full h-48">
                          <CldImage
                            src={case_.images[0].cloudinary_url}
                            alt={case_.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-2 right-2 w-5 h-5 flex items-center justify-center bg-black/40 rounded-full text-xs text-white opacity-70">
                            {parseInt(case_.title.replace(/[^0-9]/g, '')) || '?'}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-cerebri text-sm uppercase tracking-wide font-light">{case_.title}</h3>
                        {case_.description && (
                          <p className="text-muted-foreground text-sm mt-1">{case_.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border rounded-lg">
                <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Cases Yet</h3>
                <p className="text-muted-foreground">
                  This album is currently empty. Check back soon for new content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
