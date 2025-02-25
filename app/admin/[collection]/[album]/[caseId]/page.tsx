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
  "dermatology": {
    title: "Dermatology",
    description: "Before and after photos of dermatology treatments",
    albums: {
      "skin-screening": { title: "Skin Screening" },
      "acne": { title: "Acne" },
      "eczema": { title: "Eczema" },
      "rosacea": { title: "Rosacea" },
      "psoriasis": { title: "Psoriasis" }
    }
  },
  "medical-spa": {
    title: "Medical Spa",
    description: "Before and after photos of medical spa treatments",
    albums: {
      "emsculpt": { title: "Emsculpt" },
      "body-analysis": { title: "Body Analysis" },
      "skin-rejuvenation": { title: "Skin Rejuvenation" },
      "injectables": { title: "Injectables" },
      "laser-treatments": { title: "Laser Treatments" },
      "facial-treatments": { title: "Facial Treatments" }
    }
  },
  "functional-medicine": {
    title: "Functional Medicine",
    description: "Before and after photos of functional medicine treatments",
    albums: {
      "cardiometabolic-optimization": { title: "Cardiometabolic Optimization" },
      "epigenetic-optimization": { title: "Epigenetic Optimization" },
      "hair-restoration": { title: "Hair Restoration" },
      "hormone-optimization": { title: "Hormone Optimization" },
      "neurocognitive-performance": { title: "Neurocognitive Performance" },
      "sleep-travel-optimization": { title: "Sleep & Travel Optimization" }
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

  if (!collection || !album) {
    return <div>Album not found</div>;
  }

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
        <Link 
          href={`/admin/gallery/${collectionId}/${albumId}`} 
          className="inline-flex items-center text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {album.title}
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