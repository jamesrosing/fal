'use client';

import { ArticleManager } from '@/components/features/articles/components/articleManager';
import { Toaster } from '@/components/shared/ui/toaster';
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


/**
 * Admin Articles Management Page
 * 
 * A comprehensive interface for creating and managing articles with AI assistance
 */
export default function AdminArticlesPage() {
  return (
    <div className="h-full">
      <ArticleManager />
      <Toaster />
    </div>
  );
} 