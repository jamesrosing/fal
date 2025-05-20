import { getGalleries, getAlbumsByGallery, getCasesByAlbum } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import CldImage from '@/components/media/CldImage';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AlbumPageProps {
  params: {
    collection: string;
    album: string;
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  // Fetch all galleries to verify collection exists
  const galleries = await getGalleries();
  
  if (!galleries || galleries.length === 0) {
    notFound();
  }
  
  // Find the current gallery by slug (collection param)
  const currentGallery = galleries.find(
    gallery => gallery.title.toLowerCase().replace(/\s+/g, '-') === params.collection
  );
  
  if (!currentGallery) {
    notFound();
  }
  
  // Get albums for this gallery
  const albums = await getAlbumsByGallery(currentGallery.id);
  
  if (!albums || albums.length === 0) {
    notFound();
  }
  
  // Find the current album by slug
  const currentAlbum = albums.find(
    album => album.title === params.album || 
             album.title.toLowerCase().replace(/\s+/g, '-') === params.album
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
  
  return (
    <main className="min-h-screen bg-black flex flex-col pt-16">
      <NavBar />
      
      {/* Hero Section */}
      <div className="w-full">
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
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/gallery" className="text-white/70 hover:text-white transition-colors">
                Gallery
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href={`/gallery/${params.collection}`} className="text-white/70 hover:text-white transition-colors">
                {currentGallery.title}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentAlbum.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-serif text-white">
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
                <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors">
                  {case_.images && case_.images[0] ? (
                    <div className="relative w-full h-48">
                      <CldImage
                        src={case_.images[0].cloudinary_url}
                        alt={case_.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2 w-5 h-5 flex items-center justify-center bg-black/40 rounded-full text-xs text-zinc-400 opacity-70">
                        {parseInt(case_.title.replace(/[^0-9]/g, '')) || '?'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-500">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-cerebri text-sm uppercase tracking-wide font-light text-white">{case_.title}</h3>
                    {case_.description && (
                      <p className="text-zinc-400 text-sm mt-1">{case_.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-zinc-900/50 rounded-lg">
            <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Cases Yet</h3>
            <p className="text-zinc-400">
              This album is currently empty. Check back soon for new content.
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 