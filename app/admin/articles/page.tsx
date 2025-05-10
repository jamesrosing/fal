'use client';

import { ArticleManager } from '@/components/ArticleManager';
import { Toaster } from '@/components/ui/toaster';
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


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