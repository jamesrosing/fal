'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAlbumsByGallery, getCasesByAlbum } from '@/lib/supabase';

interface CollectionStats {
  albumCount: number;
  caseCount: number;
  photoCount: number;
}

// Use the same collections structure from layout
const collections = {
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
  const [collectionStats, setCollectionStats] = useState<Record<string, CollectionStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollectionStats() {
      try {
        const stats: Record<string, CollectionStats> = {};
        
        // For each collection
        for (const [collectionId, collection] of Object.entries(collections)) {
          // Get all albums for this collection
          const albums = await getAlbumsByGallery(collectionId);
          if (!albums) continue;
          
          let totalCases = 0;
          let totalPhotos = 0;
          
          // For each album, get its cases and count photos
          for (const album of albums) {
            const cases = await getCasesByAlbum(album.id);
            if (!cases) continue;
            
            totalCases += cases.length;
            totalPhotos += cases.reduce((total, c) => total + (c.images?.length || 0), 0);
          }
          
          stats[collectionId] = {
            albumCount: albums.length,
            caseCount: totalCases,
            photoCount: totalPhotos
          };
        }
        
        setCollectionStats(stats);
      } catch (error) {
        console.error('Error fetching collection stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollectionStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-zinc-500">Manage your before & after photo collections</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-zinc-500">Loading collections...</p>
          </div>
        ) : (
          Object.entries(collections).map(([id, collection]) => {
            const stats = collectionStats[id] || { albumCount: 0, caseCount: 0, photoCount: 0 };
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/admin/gallery/${id}`}>
                  <Card className="hover:bg-zinc-900 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <CardTitle className="flex-1">{collection.title}</CardTitle>
                      <FolderOpen className="w-5 h-5 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-500">{collection.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">
                          {stats.albumCount} Albums
                        </span>
                        <span className="text-zinc-700">•</span>
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