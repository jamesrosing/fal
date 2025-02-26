'use client';

import { MediaManagement } from '@/components/MediaManagement';
import { Toaster } from '@/components/ui/toaster';

/**
 * Admin Media Management Page
 * 
 * A comprehensive interface for managing media assets
 */
export default function AdminMediaPage() {
  return (
    <div className="container mx-auto h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Media Library</h1>
        <p className="text-muted-foreground">
          Manage and organize your media assets
        </p>
      </header>

      <div className="flex-grow border rounded-lg overflow-hidden bg-card">
        <MediaManagement />
      </div>
      
      <Toaster />
    </div>
  );
} 