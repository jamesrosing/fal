"use client"

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCase } from '@/lib/supabase';
import { CaseViewer } from '@/components/case-viewer';

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

export default function CasePage() {
  const params = useParams();
  const collectionId = params.collection as string;
  const albumId = params.album as string;
  const caseId = params.caseId as string;
  const collection = collections[collectionId];
  const album = collection?.albums[albumId];
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      try {
        const caseData = await getCase(caseId);
        setCurrentCase(caseData);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    }

    if (collection && album && caseId) {
      fetchCase();
    }
  }, [caseId, collection, album]);

  if (!collection || !album) {
    return <div>Album not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href={`/admin/gallery/${collectionId}/${albumId}`} 
          className="inline-flex items-center text-zinc-500 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {album.title}
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {currentCase?.title || 'Loading...'}
          </h1>
          {currentCase?.description && (
            <p className="text-zinc-500">{currentCase.description}</p>
          )}
        </div>
      </div>

      {/* Case Viewer */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading case...</p>
          </div>
        ) : !currentCase ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Case not found</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
} 