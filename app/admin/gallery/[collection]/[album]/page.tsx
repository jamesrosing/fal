import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getGallery, getAlbum, getCasesByAlbum } from '@/lib/supabase';
import { 
  PlusCircleIcon, 
  ImageIcon, 
  Edit2Icon, 
  Trash2Icon,
  ArrowLeftIcon,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import CldImage from '@/components/media/CldImage';
import { formatDate } from '@/lib/utils';

interface AdminGalleryAlbumPageProps {
  params: {
    collection: string;
    album: string;
  };
}

export async function generateMetadata({ params }: AdminGalleryAlbumPageProps): Promise<Metadata> {
  const album = await getAlbum(params.album);
  return {
    title: album ? `${album.title} | Gallery Cases` : 'Gallery Album',
    description: 'Manage cases in this gallery album',
  };
}

export default async function AdminGalleryAlbumPage({ params }: AdminGalleryAlbumPageProps) {
  const gallery = await getGallery(params.collection);
  const album = await getAlbum(params.album);
  
  if (!gallery || !album) {
    notFound();
  }
  
  const cases = await getCasesByAlbum(album.id);
  
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
                <BreadcrumbLink href={`/admin/gallery/${params.collection}`}>{gallery.title}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{album.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{album.title} Cases</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/gallery/${params.collection}`}>
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Albums
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/admin/gallery/${params.collection}/${params.album}/new`}>
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  New Case
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            {album.description || `Manage cases in the ${album.title} album.`}
          </p>
        </div>
        
        {cases && cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} className="overflow-hidden">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {caseItem.images && caseItem.images.length > 0 ? (
                    <CldImage
                      src={caseItem.images[0].cloudinary_url.replace(/^.*\/upload\//, '')}
                      fill
                      className="object-cover"
                      alt={caseItem.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{caseItem.title}</CardTitle>
                  <CardDescription>
                    {formatDate(caseItem.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {caseItem.procedure && (
                      <Badge variant="secondary">{caseItem.procedure}</Badge>
                    )}
                    {caseItem.patient_gender && (
                      <Badge variant="outline">{caseItem.patient_gender}</Badge>
                    )}
                    {caseItem.patient_age && (
                      <Badge variant="outline">Age: {caseItem.patient_age}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {caseItem.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gallery/${params.collection}/${params.album}/${caseItem.id}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      View Live
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/gallery/${params.collection}/${params.album}/${caseItem.id}/edit`}>
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
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Cases Yet</h3>
            <p className="text-muted-foreground mb-6">
              This album doesn't have any cases yet. Create your first case to get started.
            </p>
            <Button asChild>
              <Link href={`/admin/gallery/${params.collection}/${params.album}/new`}>
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create First Case
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 