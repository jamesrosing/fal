'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Keep the existing collections structure
const collections = {
  "plastic-surgery": {
    title: "Plastic Surgery",
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
    albums: {
      "abdomen": { title: "Abdomen" },
      "buttocks": { title: "Buttocks" },
      "arms": { title: "Arms" },
      "calves": { title: "Calves" }
    }
  },
  "sylfirmx": {
    title: "Sylfirm X",
    albums: {
      "face": { title: "Face" }
    }
  },
  "facials": {
    title: "Facials",
    albums: {
      "hydrafacial": { title: "HydraFacial" }
    }
  }
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

  // Parse the current path to set active items
  useEffect(() => {
    const parts = pathname.split('/');
    const collectionIndex = parts.indexOf('gallery') + 1;
    if (parts[collectionIndex]) {
      setActiveCollection(parts[collectionIndex]);
      // Only set active album if it's not a UUID (case ID)
      if (parts[collectionIndex + 1] && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parts[collectionIndex + 1])) {
        setActiveAlbum(parts[collectionIndex + 1]);
      }
    }
  }, [pathname]);

  return (
    <div className="flex h-screen">
      {/* Gallery Navigation Sidebar */}
      <div className="w-64 border-r border-zinc-800 bg-black">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Gallery</h2>
              <Link href="/admin/gallery/new">
                <Button variant="outline" size="sm">
                  New Case
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {Object.entries(collections).map(([id, collection]) => (
                <div key={id} className="space-y-1">
                  <Link href={`/admin/gallery/${id}`}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/50",
                        activeCollection === id && "bg-zinc-800"
                      )}
                    >
                      <FolderOpen className="w-4 h-4 text-zinc-200" />
                      <span className="text-zinc-200">{collection.title}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-auto transition-transform text-zinc-200",
                        activeCollection === id && "rotate-90"
                      )} />
                    </div>
                  </Link>

                  {activeCollection === id && (
                    <div className="ml-4 pl-2 border-l border-zinc-800 space-y-1">
                      {Object.entries(collection.albums).map(([albumId, album]) => (
                        <Link
                          key={albumId}
                          href={`/admin/gallery/${id}/${albumId}`}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/50",
                              activeAlbum === albumId && "bg-zinc-800"
                            )}
                          >
                            <ImageIcon className="w-4 h-4 text-zinc-200" />
                            <span className="text-zinc-200">{album.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-zinc-950">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 