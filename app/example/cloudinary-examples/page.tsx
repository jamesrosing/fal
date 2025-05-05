'use client';

import React from 'react';
import CloudinaryFolderImage from '@/components/media/CloudinaryFolderImage';
import CloudinaryFolderGallery from '@/components/media/CloudinaryFolderGallery';
import { FOLDERS } from '@/lib/cloudinary/folder-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CloudinaryExamplesPage() {
  // Example gallery images
  const galleryImages = [
    { folder: FOLDERS.EMSCULPT_GALLERY + '/abdomen', alt: 'Emsculpt Abdomen Before & After' },
    { folder: FOLDERS.EMSCULPT_GALLERY + '/arms', alt: 'Emsculpt Arms Before & After' },
    { folder: FOLDERS.FACIALS_GALLERY, alt: 'Facial Treatment Results' },
    { folder: FOLDERS.PLASTIC_SURGERY_GALLERY + '/body', alt: 'Body Procedure Before & After' },
    { folder: FOLDERS.PLASTIC_SURGERY_GALLERY + '/breast', alt: 'Breast Procedure Before & After' },
    { folder: FOLDERS.PLASTIC_SURGERY_GALLERY + '/head-and-neck', alt: 'Face Procedure Before & After' },
  ];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Folder Image Examples</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Single Images from Folders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Image</CardTitle>
              <CardDescription>Loading from services folder</CardDescription>
            </CardHeader>
            <CardContent>
              <CloudinaryFolderImage
                folder={FOLDERS.DERMATOLOGY}
                alt="Dermatology Service"
                width={400}
                height={300}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Member</CardTitle>
              <CardDescription>Loading from team folder</CardDescription>
            </CardHeader>
            <CardContent>
              <CloudinaryFolderImage
                folder={FOLDERS.TEAM}
                alt="Team Member Portrait"
                width={400}
                height={500}
                className="rounded-md"
                crop="thumb"
                gravity="face"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Home Page Hero</CardTitle>
              <CardDescription>Loading from home page folder</CardDescription>
            </CardHeader>
            <CardContent>
              <CloudinaryFolderImage
                folder={FOLDERS.HOME}
                imageName="hero"
                alt="Home Page Hero"
                width={400}
                height={250}
                className="rounded-md"
                priority={true}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Gallery Grid from Folders</h2>
        <Card>
          <CardHeader>
            <CardTitle>Before & After Gallery</CardTitle>
            <CardDescription>Loading from multiple folders</CardDescription>
          </CardHeader>
          <CardContent>
            <CloudinaryFolderGallery
              images={galleryImages}
              columns={3}
              gap={16}
              imageWidth={400}
              imageHeight={300}
              className="mb-6"
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Production Usage Instructions</h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Make sure Cloudinary environment variables are set in <code>.env</code> file</li>
              <li>Use the <code>CloudinaryFolderImage</code> component to render single images</li>
              <li>Use the <code>CloudinaryFolderGallery</code> component to render image grids</li>
              <li>Import folder constants from <code>lib/cloudinary/folder-utils</code></li>
              <li>For production, set proper <code>width</code>, <code>height</code>, and <code>sizes</code> props for responsive images</li>
              <li>Use <code>priority</code> prop for above-the-fold images</li>
              <li>Use <code>gravity</code> and <code>crop</code> props to control image cropping</li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 