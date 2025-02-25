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
  const caseId = params.caseId as string;
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/gallery" className="inline-flex items-center text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">{currentCase.title}</h1>
      
      {currentCase.description && (
        <p className="text-zinc-400 mb-8">{currentCase.description}</p>
      )}
      
      <CaseViewer images={currentCase.images} />
    </div>
  );
} 