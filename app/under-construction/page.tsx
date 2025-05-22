import React from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


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