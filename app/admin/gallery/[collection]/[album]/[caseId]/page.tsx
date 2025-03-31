"use client"

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, Save, Loader2, MoveVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCase } from '@/lib/supabase';
import { CaseViewer } from '@/components/case-viewer';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface Case {
  id: string;
  title: string;
  description: string;
  album_id: string;
  images: Array<{
    id: string;
    cloudinary_url: string;
    display_order?: number;
  }>;
}

interface Album {
  title: string;
}

interface Collection {
  title: string;
  description: string;
  albums: {
    [key: string]: Album;
  };
}

interface Collections {
  [key: string]: Collection;
}

const collections: Collections = {
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

interface SortableImageProps {
  image: {
    id: string;
    cloudinary_url: string;
    display_order?: number;
  };
  deletingImageId: string | null;
  onDelete: (imageId: string, url: string) => void;
}

function SortableImage({ image, deletingImageId, onDelete }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative border rounded-lg overflow-hidden group"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 z-10 bg-black/40 p-1 rounded-md cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <MoveVertical className="h-4 w-4 text-white" />
      </div>
      <img 
        src={image.cloudinary_url} 
        alt="Case image" 
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(image.id, image.cloudinary_url)}
          disabled={!!deletingImageId}
        >
          {deletingImageId === image.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="ml-2">Delete</span>
        </Button>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-md">
        Order: {image.display_order || 0}
      </div>
    </div>
  );
}

export default function CasePage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collection as string;
  const albumId = params.album as string;
  const caseId = params.caseId as string;
  const collection = collections[collectionId];
  const album = collection?.albums?.[albumId];
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const caseData = await getCase(caseId);
        setCurrentCase(caseData);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const handleDeleteImage = async (imageId: string, publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }
    
    try {
      setDeletingImageId(imageId);
      
      // Extract the public ID from the Cloudinary URL
      const cloudinaryPublicId = publicId.split('/upload/')[1].split('.')[0];
      
      // Delete from Cloudinary
      await deleteFromCloudinary(cloudinaryPublicId);
      
      // Delete from database
      const response = await fetch(`/api/gallery/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image from database');
      }
      
      // Update local state
      if (currentCase) {
        setCurrentCase({
          ...currentCase,
          images: currentCase.images.filter(img => img.id !== imageId)
        });
      }
      
      toast({
        title: "Image deleted",
        description: "The image has been removed from this case."
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile || !currentCase) return;
    
    try {
      setUploading(true);
      
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        imageFile,
        'gallery',
        `${collectionId}/${albumId}/${caseId}`,
        imageFile.name
      );
      
      // Add to database
      const response = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId,
          cloudinary_url: uploadResult.url,
          caption: imageCaption || 'Before & After',
          tags: ['composite']
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save image to database');
      }
      
      const newImage = await response.json();
      
      // Update local state
      setCurrentCase({
        ...currentCase,
        images: [...currentCase.images, newImage]
      });
      
      // Reset form
      setImageFile(null);
      setImageCaption('');
      setUploadOpen(false);
      
      toast({
        title: "Image uploaded",
        description: "The new image has been added to this case."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !currentCase) {
      return;
    }
    
    const oldIndex = currentCase.images.findIndex(img => img.id === active.id);
    const newIndex = currentCase.images.findIndex(img => img.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    // Create a new array with the updated order
    const reorderedImages = arrayMove(currentCase.images, oldIndex, newIndex);
    
    // Update the display_order for each image
    const updatedImages = reorderedImages.map((img: any, index: number) => ({
      ...img,
      display_order: index + 1
    }));
    
    // Optimistically update the UI
    setCurrentCase({
      ...currentCase,
      images: updatedImages
    });
    
    try {
      setReordering(true);
      
      // Call API to update order in the database
      const response = await fetch('/api/gallery/images/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: currentCase.id,
          image_orders: updatedImages.map((img: any) => ({
            id: img.id,
            display_order: img.display_order 
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update image order');
      }
      
      toast({
        title: "Order updated",
        description: "The image order has been updated."
      });
    } catch (error) {
      console.error('Error updating image order:', error);
      toast({
        title: "Error",
        description: "Failed to update image order. Please try again.",
        variant: "destructive"
      });
      
      // Revert to the original order
      if (currentCase) {
        setCurrentCase({ ...currentCase });
      }
    } finally {
      setReordering(false);
    }
  };

  if (!collection || !album) {
    return <div>Album not found</div>;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Loading case...</p>
      </div>
    );
  }

  if (!currentCase) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Case not found</p>
      </div>
    );
  }

  const caseImages = currentCase.images?.map(image => ({
    id: image.id,
    url: image.cloudinary_url,
    display_order: image.display_order || 0
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link 
          href={`/admin/gallery/${collectionId}/${albumId}`} 
          className="inline-flex items-center text-zinc-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {album.title}
        </Link>
        
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="image">Image (Before/After Composite)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  placeholder="e.g., Front view - Before & After"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadImage}
                disabled={!imageFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentCase.title}</h1>
        <p className="text-xs text-zinc-400 opacity-70">ID: {currentCase.id}</p>
      </div>
      
      {currentCase.description && (
        <p className="text-zinc-400 mb-8">{currentCase.description}</p>
      )}
      
      <div className="space-y-8">
        {/* Image Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Images</h2>
            {reordering && (
              <p className="text-sm text-amber-400">
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                Saving order...
              </p>
            )}
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentCase.images.map(img => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentCase.images.map(image => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    deletingImageId={deletingImageId}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        
        {/* Case Viewer Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Case Preview</h2>
          <CaseViewer images={caseImages} />
        </div>
      </div>
    </div>
  );
} 