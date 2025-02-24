"use client"

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCase, getCasesByAlbum, getAlbumsByGallery } from '@/lib/supabase';
import { CaseViewer } from '@/components/case-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Case {
  id: string;
  title: string;
  description: string;
  images: Array<{
    id: string;
    cloudinary_url: string;
  }>;
}

interface Album {
  id: string;
  title: string;
}

interface Collection {
  title: string;
  description: string;
  albums: Record<string, Album>;
}

// Use the same collections structure
const collections: Record<string, Collection> = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    description: "Before and after photos of plastic surgery procedures",
    albums: {
      "face": { title: "Face" },
      "eyelids": { title: "Eyelids" },
      "ears": { title: "Ears" },
      "nose": { title: "Nose" },
      "neck": { title: "Neck" },
      "breast-augmentation": { title: "Breast Augmentation" },
      "breast-lift": { title: "Breast Lift" },
      "breast-reduction": { title: "Breast Reduction" },
      "breast-revision": { title: "Breast Revision" },
      "breast-nipple-areolar-complex": { title: "Breast Nipple Areolar Complex" },
      "abdominoplasty": { title: "Abdominoplasty" },
      "mini-abdominoplasty": { title: "Mini Abdominoplasty" },
      "liposuction": { title: "Liposuction" },
      "arm-lift": { title: "Arm Lift" },
      "thigh-lift": { title: "Thigh Lift" }
    }
  },
  "emsculpt": {
    title: "Emsculpt",
    description: "Before and after photos of EMSculpt treatments",
    albums: {
      "abdomen": { title: "Abdomen" },
      "buttocks": { title: "Buttocks" },
      "arms": { title: "Arms" },
      "calves": { title: "Calves" }
    }
  },
  "sylfirmx": {
    title: "Sylfirm X",
    description: "Before and after photos of Sylfirm X treatments",
    albums: {
      "face": { title: "Face" }
    }
  },
  "facials": {
    title: "Facials",
    description: "Before and after photos of facial treatments",
    albums: {
      "hydrafacial": { title: "HydraFacial" }
    }
  }
};

export default function GalleryPage() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionId = slug[0];
  const albumId = slug[1];
  const caseId = slug[2];
  const collection = collections[collectionId];
  const album = collection?.albums[albumId];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // If we have a case ID, fetch the case
        if (caseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)) {
          const caseData = await getCase(caseId);
          setCurrentCase(caseData);
        }
        // If we have an album ID, fetch cases for that album
        else if (albumId) {
          const albums = await getAlbumsByGallery(collectionId);
          const dbAlbum = albums?.find(a => 
            a.title.toLowerCase().replace(/\s+/g, '-') === albumId
          );
          
          if (dbAlbum) {
            const albumCases = await getCasesByAlbum(dbAlbum.id);
            setCases(albumCases || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (collection) {
      fetchData();
    }
  }, [collectionId, albumId, caseId, collection]);

  // Render case view
  if (currentCase) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link 
            href={`/admin/gallery/${collectionId}/${albumId}`} 
            className="inline-flex items-center text-zinc-500 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {album?.title}
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {currentCase.title}
            </h1>
            {currentCase.description && (
              <p className="text-zinc-500">{currentCase.description}</p>
            )}
          </div>
        </div>

        {/* Case Viewer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CaseViewer 
            images={currentCase.images.map(img => ({
              id: img.id,
              url: img.cloudinary_url
            }))} 
          />
        </motion.div>
      </div>
    );
  }

  // Render album view
  if (album) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link 
            href={`/admin/gallery/${collectionId}`} 
            className="inline-flex items-center text-zinc-500 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {collection.title}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{album.title}</h1>
              <p className="text-zinc-500">
                {cases.length} Cases • {cases.reduce((total, c) => total + c.images.length, 0)} Photos
              </p>
            </div>
            <Link href={`/admin/gallery/${collectionId}/${albumId}/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </Button>
            </Link>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-500">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-500">No cases yet. Create your first case.</p>
            </div>
          ) : (
            cases.map((case_) => (
              <motion.div
                key={case_.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/admin/gallery/${collectionId}/${albumId}/${case_.id}`}>
                  <Card className="hover:bg-zinc-900 transition-colors cursor-pointer overflow-hidden">
                    {case_.images[0] && (
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={case_.images[0].cloudinary_url}
                          alt={case_.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="flex-1">{case_.title}</CardTitle>
                      <ImageIcon className="w-5 h-5 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-500 line-clamp-2">{case_.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Render collection view (fallback)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{collection?.title || 'Gallery'}</h1>
        <p className="text-zinc-500">{collection?.description || 'Select a collection to view cases'}</p>
      </div>
    </div>
  );
} 