"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MediaPageHeader() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
        <Button variant="outline">Documentation</Button>
      </div>
      
      <p className="text-muted-foreground">
        Upload, organize, and manage all site media. Assign media to specific pages and sections.
      </p>
      
      <div className="flex w-full items-center space-x-2 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media by filename, folder, or tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>Filter</Button>
      </div>
    </div>
  );
} 