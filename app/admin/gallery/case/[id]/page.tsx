"use client"

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCase } from '@/lib/supabase';
import { CaseViewer } from '@/components/case-viewer';

interface Case {
  id: string;
  title: string;
  description: string;
  album_id: string;
  images: Array<{
    id: string;
    cloudinary_url: string;
  }>;
}

export default function CasePage() {
  const params = useParams();
  const caseId = params.id as string;
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const caseData = await getCase(caseId);
        setCurrentCase(caseData);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Loading case...</p>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Case not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/admin/gallery"
          className="inline-flex items-center text-zinc-500 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
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