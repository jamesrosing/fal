import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getGallery, getAlbumsByGallery } from '@/lib/supabase';
import { 
  PlusCircleIcon, 
  FolderIcon, 
  ImageIcon, 
  Edit2Icon, 
  Trash2Icon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AdminGalleryCollectionPageProps {
  params: {
    collection: string;
  };
}

export async function generateMetadata({ params }: AdminGalleryCollectionPageProps): Promise<Metadata> {
  const gallery = await getGallery(params.collection);
  return {
    title: gallery ? `${gallery.title} | Gallery Management` : 'Gallery Collection',
    description: 'Manage albums in this gallery collection',
  };
}

export default async function AdminGalleryCollectionPage({ params }: AdminGalleryCollectionPageProps) {
  const gallery = await getGallery(params.collection);
  
  if (!gallery) {
    notFound();
  }
  
  const albums = await getAlbumsByGallery(params.collection);
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/gallery">Gallery</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{gallery.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{gallery.title} Albums</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/gallery">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Collections
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/admin/gallery/${params.collection}/new`}>
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  New Album
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            {gallery.description || `Manage albums in the ${gallery.title} gallery.`}
          </p>
        </div>
        
        {albums && albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{album.title}</CardTitle>
                  <CardDescription>
                    {album.case_count || 0} cases
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {album.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/gallery/${params.collection}/${album.slug}`}>
                      <FolderIcon className="mr-2 h-4 w-4" />
                      View Cases
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/gallery/${params.collection}/${album.slug}/edit`}>
                        <Edit2Icon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg text-center px-4">
            <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Albums Yet</h3>
            <p className="text-muted-foreground mb-6">
              This gallery collection doesn't have any albums yet. Create your first album to get started.
            </p>
            <Button asChild>
              <Link href={`/admin/gallery/${params.collection}/new`}>
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create First Album
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 