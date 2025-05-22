'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';
import { Card, CardContent } from '@/components/shared/ui/card';
import { useToast } from '@/components/shared/ui/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary';
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


interface Collection {
  title: string;
  description: string;
  albums: Record<string, { title: string }>;
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
  "emsculpt": {
    title: "Emsculpt",
    description: "Before and after photos of EMSculpt treatments",
    albums: {
      "abdomen": { title: "Abdomen" },
      "buttocks": { title: "Buttocks" },
      "arms": { title: "Arms" },
      "calves": { title: "Calves" }
    }
  },
  "sylfirmx": {
    title: "Sylfirm X",
    description: "Before and after photos of Sylfirm X treatments",
    albums: {
      "face": { title: "Face" }
    }
  },
  "facials": {
    title: "Facials",
    description: "Before and after photos of facial treatments",
    albums: {
      "hydrafacial": { title: "HydraFacial" }
    }
  }
};

interface ImageAngle {
  id: string;
  angle: string;
  compositeImage?: File;
  compositeImagePreview?: string;
}

interface FormData {
  title: string;
  description: string;
  images: ImageAngle[];
  metadata: {
    patientAge?: string;
    treatmentDate?: string;
    followUpDate?: string;
    notes?: string;
  };
}

const DEFAULT_ANGLES = [
  'Front View',
  'Left Side',
  'Right Side',
  'Oblique Left',
  'Oblique Right',
];

export default function NewCasePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    images: DEFAULT_ANGLES.map((angle, index) => ({
      id: String(index + 1),
      angle,
      compositeImage: undefined,
      compositeImagePreview: undefined,
    })),
    metadata: {}
  });

  const collectionId = params.collection as string;
  const albumId = params.album as string;
  const collection = collections[collectionId];
  const album = collection?.albums[albumId];

  if (!collection || !album) {
    return <div>Album not found</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === imageId
          ? {
              ...img,
              compositeImage: file,
              compositeImagePreview: preview
            }
          : img
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImages = formData.images.some(img => img.compositeImage);
    if (!hasImages) {
      toast({
        title: 'Error',
        description: 'Please upload at least one before & after image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        formData.images
          .filter(img => img.compositeImage)
          .map(async (img) => {
            const result = await uploadToCloudinary(
              img.compositeImage!,
              'gallery',
              `${collectionId}/${albumId}`,
              `${img.angle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
            );

            return {
              angle: img.angle,
              url: result.url,
            };
          })
      );

      // Create case in database
      const response = await fetch('/api/gallery/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          albumId,
          title: formData.title,
          description: formData.description,
          metadata: formData.metadata,
          images: uploadedImages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      toast({
        title: 'Success',
        description: 'Case created successfully',
      });

      router.push(`/admin/gallery/${collectionId}/${albumId}`);
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href={`/admin/gallery/${collectionId}/${albumId}`} 
          className="inline-flex items-center text-zinc-200 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {album.title}
        </Link>
        <h1 className="text-2xl font-bold">New Case</h1>
        <p className="text-zinc-500">Add a new before & after case to {album.title}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., EMSculpt Case #123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the case..."
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-8">
                <Label>Before & After Images</Label>
                <p className="text-sm text-zinc-500 mt-1">
                  Upload side-by-side before & after images for each angle. Images should be pre-composed with before on the left and after on the right.
                </p>
                {formData.images.map((img) => (
                  <div key={img.id} className="space-y-4">
                    <h4 className="text-sm font-medium text-zinc-400">{img.angle}</h4>
                    <div className="relative aspect-[2/1]">
                      <Card className="absolute inset-0">
                        {img.compositeImagePreview ? (
                          <>
                            <Image
                              src={img.compositeImagePreview}
                              alt={`${img.angle} Before & After`}
                              fill
                              className="object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                images: prev.images.map(i =>
                                  i.id === img.id
                                    ? { ...i, compositeImage: undefined, compositeImagePreview: undefined }
                                    : i
                                )
                              }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-800 hover:border-primary">
                            <Upload className="w-8 h-8 mb-2 text-zinc-500" />
                            <span className="text-sm text-zinc-500">Upload Before & After Image</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, img.id)}
                            />
                          </label>
                        )}
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientAge">Patient Age</Label>
                  <Input
                    id="patientAge"
                    value={formData.metadata.patientAge || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, patientAge: e.target.value }
                    })}
                    placeholder="e.g., 35"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentDate">Treatment Date</Label>
                  <Input
                    id="treatmentDate"
                    type="date"
                    value={formData.metadata.treatmentDate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, treatmentDate: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.metadata.followUpDate || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, followUpDate: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.metadata.notes || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, notes: e.target.value }
                    })}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Case'}
          </Button>
        </div>
      </form>
    </div>
  );
} 