'use client';

import { useState } from 'react';
import CloudinaryExample from '@/components/example/CloudinaryExample';
import CloudinaryBrowser from '@/components/example/CloudinaryBrowser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CloudinaryExamplesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cloudinary Examples</h1>
        <p className="text-gray-600">
          Examples of using next-cloudinary components with custom wrappers
        </p>
      </div>
      
      <Tabs defaultValue="browser">
        <TabsList className="mb-4">
          <TabsTrigger value="browser">Asset Browser</TabsTrigger>
          <TabsTrigger value="examples">Component Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browser">
          <div className="border rounded-lg p-6 bg-white">
            <CloudinaryBrowser />
          </div>
        </TabsContent>
        
        <TabsContent value="examples">
          <div className="border rounded-lg p-6 bg-white">
            <CloudinaryExample />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 