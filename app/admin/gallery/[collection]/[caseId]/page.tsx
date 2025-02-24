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

interface Collection {
  title: string;
  description: string;
}

// Use the same collections structure
const collections: Record<string, Collection> = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    description: "Before and after photos of plastic surgery procedures"
  },
  "emsculpt": {
    title: "Emsculpt",
    description: "Before and after photos of EMSculpt treatments"
  },
  "sylfirmx": {
    title: "Sylfirm X",
    description: "Before and after photos of Sylfirm X treatments"
  },
  "facials": {
    title: "Facials",
    description: "Before and after photos of facial treatments"
  }
};

export default function CasePage() {
  const params = useParams();
  const collectionId = params.collection as string;
  const caseId = params.caseId as string;
  const collection = collections[collectionId];
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

    if (collection && caseId) {
      fetchCase();
    }
  }, [caseId, collection]);

  if (!collection) {
    return <div>Collection not found</div>;
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