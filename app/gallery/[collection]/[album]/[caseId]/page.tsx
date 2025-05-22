import { getGalleries, getAlbumsByGallery, getCasesByAlbum, getCase, Image as GalleryImage } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from '@/components/shared/layout/nav-bar';
import { CaseViewer } from '@/components/features/gallery/case-viewer';
import CldImage from '@/components/shared/media/CldImage';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/shared/ui/breadcrumb';
import { SidebarInset } from '@/components/shared/ui/sidebar-inset';
import { SidebarProvider } from '@/components/shared/ui/sidebar';
import { GallerySidebar } from '@/components/features/gallery/GallerySidebar';
import { AppSidebar } from '@/components/features/admin/app-sidebar';
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { Button } from '@/components/shared/ui/button';

interface CasePageProps {
  params: {
    collection: string;
    album: string;
    caseId: string;
  }
}

// Extend the Case type to include metadata
interface CaseWithMetadata {
  metadata?: Record<string, any>;
  [key: string]: any;
}

export default async function CasePage({ params }: CasePageProps) {
  // Fetch the case data first to check if it exists
  const currentCase = await getCase(params.caseId) as CaseWithMetadata;
  
  if (!currentCase) {
    notFound();
  }
  
  // Fetch all galleries to get navigation context
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
  
  // Get albums for this gallery
  const albums = await getAlbumsByGallery(params.collection);
  
  if (!albums || albums.length === 0) {
    notFound();
  }
  
  // Find the current album by slug
  const currentAlbum = albums.find(
    album => album.title.toLowerCase() === params.album.toLowerCase() || 
             album.title.toLowerCase().replace(/\s+/g, '-') === params.album.toLowerCase()
  );
  
  if (!currentAlbum) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-black flex flex-col pt-16">
      <NavBar />
      
      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link 
                href={`/gallery/${params.collection}/${params.album}`} 
                className="text-white/70 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Album
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Case {parseInt(currentCase.title.replace(/[^0-9]/g, '')) || currentCase.id}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="pb-4 mb-8 border-b border-zinc-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-cerebri text-md uppercase tracking-wide font-light text-white/80">
              {currentGallery.title} &mdash; {currentAlbum.title}
            </h1>
            <h2 className="text-3xl font-serif text-white mt-1">
              {currentCase.title}
            </h2>
            {currentCase.description && (
              <p className="text-zinc-300 mt-2 font-light">
                {currentCase.description}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-zinc-400 hover:text-white">
              <Heart className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="text-zinc-400 hover:text-white">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Case images */}
        <div className="mt-8">
          {currentCase.images && currentCase.images.length > 0 ? (
            <CaseViewer 
              images={currentCase.images.map((img: GalleryImage) => ({
                id: img.id,
                url: img.cloudinary_url,
                type: img.type === 'video' ? 'video' : 'image'
              }))} 
            />
          ) : (
            <div className="text-center py-12 px-4 bg-zinc-900/50 rounded-lg">
              <h3 className="font-cerebri font-light uppercase tracking-wide text-xl mb-2">No Images Available</h3>
              <p className="text-zinc-400">
                This case currently has no images. Please check back later.
              </p>
            </div>
          )}
        </div>
        
        {/* Display metadata if available */}
        {currentCase.metadata && Object.keys(currentCase.metadata).length > 0 && (
          <div className="mt-12 bg-zinc-900/30 p-6 rounded-lg">
            <h3 className="text-xl font-serif text-white mb-4">Case Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(currentCase.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm text-zinc-400 uppercase tracking-wide font-cerebri">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="text-white mt-1">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 