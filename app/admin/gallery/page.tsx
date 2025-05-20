import { Metadata } from 'next';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getGalleries, getAlbumsByGallery } from '@/lib/supabase';
import Link from 'next/link';
import { 
  PlusCircleIcon, 
  FolderIcon, 
  ImageIcon, 
  Edit2Icon, 
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
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

export const metadata: Metadata = {
  title: 'Gallery Management | Allure MD Admin',
  description: 'Manage your before & after galleries, collections, and cases',
};

export default async function AdminGalleryPage() {
  const galleries = await getGalleries();
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
            <p className="text-muted-foreground">
              Manage your before & after galleries, albums, and case studies
            </p>
          </div>
          <Button>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collections overview */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                Organize your galleries into collections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800">
                {galleries && galleries.length > 0 ? (
                  galleries.map((gallery) => (
                    <div 
                      key={gallery.id} 
                      className="p-3 hover:bg-zinc-900 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FolderIcon className="h-5 w-5 mr-2 text-blue-400" />
                        <Link href={`/admin/gallery/${gallery.slug}`} className="hover:underline">
                          {gallery.title}
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <ArrowUpIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ArrowDownIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>No collections found</p>
                    <p className="text-sm">Create a new collection to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Add Collection
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent updates */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>
                Recently added or modified galleries and cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleries && galleries.slice(0, 4).map((gallery) => (
                  <Card key={gallery.id} className="border-zinc-800 bg-zinc-950">
                    <CardHeader className="p-3">
                      <CardTitle className="text-lg">{gallery.title}</CardTitle>
                      <CardDescription>
                        Updated {new Date(gallery.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm text-muted-foreground">
                            {gallery.case_count || 0} Cases
                          </span>
                        </div>
                        <Link 
                          href={`/admin/gallery/${gallery.slug}`}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Manage
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Gallery Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Total Collections</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">{galleries?.length || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Total Albums</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">
                  {galleries?.reduce((acc, gallery) => acc + (gallery.album_count || 0), 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Total Cases</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">
                  {galleries?.reduce((acc, gallery) => acc + (gallery.case_count || 0), 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Total Images</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold">
                  {galleries?.reduce((acc, gallery) => acc + (gallery.image_count || 0), 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 