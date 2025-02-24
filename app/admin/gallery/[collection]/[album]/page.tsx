'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon, ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Album {
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

// Placeholder cases data
const cases = [
  {
    id: '1',
    title: 'Case 1',
    description: 'Patient aged 35, treatment completed in 2023',
    beforeImage: '/placeholder-before.jpg',
    afterImage: '/placeholder-after.jpg',
    date: '2023-06-15',
  },
  {
    id: '2',
    title: 'Case 2',
    description: 'Patient aged 42, treatment completed in 2023',
    beforeImage: '/placeholder-before.jpg',
    afterImage: '/placeholder-after.jpg',
    date: '2023-07-20',
  },
  {
    id: '3',
    title: 'Case 3',
    description: 'Patient aged 28, treatment completed in 2023',
    beforeImage: '/placeholder-before.jpg',
    afterImage: '/placeholder-after.jpg',
    date: '2023-08-10',
  },
];

export default function AlbumPage() {
  const params = useParams();
  const collectionId = params.collection as string;
  const albumId = params.album as string;
  const collection = collections[collectionId];
  const album = collection?.albums[albumId];

  if (!collection || !album) {
    return <div>Album not found</div>;
  }

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
              {cases.length} Cases • {cases.length * 2} Photos
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
        {cases.map((caseItem) => (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{caseItem.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-square">
                    <Image
                      src={caseItem.beforeImage}
                      alt="Before"
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                      Before
                    </div>
                  </div>
                  <div className="relative aspect-square">
                    <Image
                      src={caseItem.afterImage}
                      alt="After"
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                      After
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 mt-4">{caseItem.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 