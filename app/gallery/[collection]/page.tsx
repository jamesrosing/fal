import { getGalleries, getAlbumsByGallery } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import CldImage from '@/components/media/CldImage';
import { GallerySidebar } from "@/components/GallerySidebar";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CollectionPageProps {
  params: {
    collection: string;
  },
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  // Fetch all galleries to verify collection exists
  const galleries = await getGalleries();
  
  if (!galleries || galleries.length === 0) {
    notFound();
  }
  
  // Find the current gallery by slug (collection param)
  const currentGallery = galleries.find(
    gallery => gallery.title.toLowerCase() === params.collection.toLowerCase() || 
               gallery.title.toLowerCase().replace(/\s+/g, '-') === params.collection.toLowerCase()
  );
  
  if (!currentGallery) {
    notFound();
  }
  
  // Fetch albums for this gallery
  const albums = await getAlbumsByGallery(params.collection);
  
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
  
  // Get filter values from search params
  const procedure = searchParams.procedure as string | undefined;
  const sortBy = searchParams.sort as string | undefined;
  
  // Filter albums if needed
  let filteredAlbums = albums || [];
  
  if (procedure) {
    filteredAlbums = filteredAlbums.filter(album => 
      album.tags?.includes(procedure) || album.procedure === procedure
    );
  }
  
  // Sort albums
  if (sortBy) {
    switch (sortBy) {
      case 'newest':
        filteredAlbums.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filteredAlbums.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name':
        filteredAlbums.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Default sort by sort_order
        break;
    }
  }
  
  // Extract unique procedures for the sidebar
  const procedures = Array.from(
    new Set(
      albums?.flatMap(album => album.tags || [])
        .filter(Boolean) || []
    )
  ).map(tag => ({
    id: tag,
    label: tag,
    count: (albums?.filter(album => album.tags?.includes(tag)).length || 0)
  }));

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
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
              <BreadcrumbPage>{currentGallery.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <GallerySidebar
              title={currentGallery.title}
              procedures={procedures}
              sortOptions={[
                { id: 'newest', label: 'Newest', count: albums?.length || 0 },
                { id: 'oldest', label: 'Oldest', count: albums?.length || 0 },
                { id: 'az', label: 'A-Z', count: albums?.length || 0 },
                { id: 'za', label: 'Z-A', count: albums?.length || 0 },
              ]}
              baseUrl={`/gallery/${params.collection}`}
              selectedProcedure={procedure}
              selectedSort={sortBy}
              collections={sidebarCollections}
              currentCollection={params.collection}
            />
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <h1 className="text-3xl font-bold mb-2">{currentGallery.title}</h1>
            {currentGallery.description && (
              <p className="text-muted-foreground mb-6">
                {currentGallery.description}
              </p>
            )}
            
            {filteredAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlbums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/gallery/${params.collection}/${album.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700">
                      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {/* Album thumbnail - placeholder for now */}
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-900">
                          <span className="text-slate-400 dark:text-slate-600">
                            {album.title}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium group-hover:underline">{album.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {typeof album.case_count === 'object' && album.case_count !== null 
                            ? String((album.case_count as any).count || 0) 
                            : album.case_count || 0} cases
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-xl font-medium mb-2">No albums found</h3>
                <p className="text-muted-foreground">
                  {procedure 
                    ? `No albums found matching "${procedure}". Try a different filter.` 
                    : 'No albums have been added to this collection yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
