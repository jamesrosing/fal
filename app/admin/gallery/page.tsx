'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';

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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gallery Collections</h1>
          <p className="text-zinc-500">Manage your before & after photo collections</p>
        </div>
        <Link href="/admin/gallery/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(collections).map(([id, collection]) => (
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
                      {Object.keys(collection.albums).length} Albums
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-500">
                      {Object.keys(collection.albums).reduce((count, albumId) => {
                        // TODO: Add actual case count when database is connected
                        return count + 5; // Placeholder: 5 cases per album
                      }, 0)} Cases
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 