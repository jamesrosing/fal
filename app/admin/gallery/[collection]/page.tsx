'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAlbumsByGallery, getCasesByAlbum } from '@/lib/supabase';

interface Album {
  title: string;
}

interface Collection {
  title: string;
  description: string;
  albums: Record<string, Album>;
}

interface AlbumStats {
  id: string;
  caseCount: number;
  photoCount: number;
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

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.collection as string;
  const collection = collections[collectionId];
  const [albumStats, setAlbumStats] = useState<Record<string, AlbumStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbumStats() {
      try {
        // Get all albums for this gallery
        const albums = await getAlbumsByGallery(collectionId);
        
        // For each album, get its cases and count photos
        const stats: Record<string, AlbumStats> = {};
        
        for (const album of albums || []) {
          const cases = await getCasesByAlbum(album.id);
          const photoCount = cases?.reduce((total, c) => total + (c.images?.length || 0), 0) || 0;
          
          stats[album.title.toLowerCase().replace(/\s+/g, '-')] = {
            id: album.id,
            caseCount: cases?.length || 0,
            photoCount
          };
        }
        
        setAlbumStats(stats);
      } catch (error) {
        console.error('Error fetching album stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (collection) {
      fetchAlbumStats();
    }
  }, [collectionId, collection]);

  if (!collection) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/gallery" className="inline-flex items-center text-zinc-500 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{collection.title}</h1>
            <p className="text-zinc-500">{collection.description}</p>
          </div>
          <Link href={`/admin/gallery/${collectionId}/new`}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-zinc-500">Loading albums...</p>
          </div>
        ) : (
          Object.entries(collection.albums).map(([id, album]) => {
            const stats = albumStats[id] || { caseCount: 0, photoCount: 0 };
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/admin/gallery/${collectionId}/${id}`}>
                  <Card className="hover:bg-zinc-900 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="flex-1">{album.title}</CardTitle>
                      <ImageIcon className="w-5 h-5 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">
                          {stats.caseCount} Cases
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-zinc-500">
                          {stats.photoCount} Photos
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
} 