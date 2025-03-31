import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export default function UnderConstructionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-2 border-amber-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Page Under Construction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            We're currently working on this page. Please check back soon for updates.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 