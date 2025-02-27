'use client';

import { SiteMediaManager } from '@/components/SiteMediaManager';
import { Toaster } from '@/components/ui/toaster';

/**
 * Admin Media Management Page
 * 
 * A comprehensive interface for managing website media assets organized by site structure
 */
export default function AdminMediaPage() {
  return (
    <div className="container mx-auto h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Website Media</h1>
        <p className="text-muted-foreground">
          Manage media assets for your website pages and sections
        </p>
      </header>

      <div className="flex-grow border rounded-lg overflow-hidden bg-card">
        <SiteMediaManager />
      </div>
      
      <Toaster />
    </div>
  );
} 