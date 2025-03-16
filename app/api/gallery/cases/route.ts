import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  caption: string;
  tags: string[];
}

interface Case {
  id: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  images: GalleryImage[];
}

// Validation schema for images
const imageSchema = z.object({
  angle: z.string(),
  url: z.string().url(),
});

// Validation schema for new case
const newCaseSchema = z.object({
  collectionId: z.string(),
  albumId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  metadata: z.object({
    patientAge: z.string().optional(),
    treatmentDate: z.string().optional(),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
  }),
  images: z.array(imageSchema),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = newCaseSchema.parse(body);

    // Get the album ID from the database based on collection and album slugs
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('id')
      .eq('gallery_id', validatedData.collectionId)
      .eq('title', validatedData.albumId)
      .single();

    if (albumError || !album) {
      console.error('Error finding album:', albumError);
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    // Create the case
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        album_id: album.id,
        title: validatedData.title,
        description: validatedData.description,
        metadata: {
          ...validatedData.metadata,
          angles: validatedData.images.map(img => img.angle),
        },
      })
      .select()
      .single();

    if (caseError || !newCase) {
      console.error('Error creating case:', caseError);
      return NextResponse.json(
        { error: 'Failed to create case' },
        { status: 500 }
      );
    }

    // Create the images
    const images = validatedData.images.map(img => ({
      case_id: newCase.id,
      cloudinary_url: img.url,
      caption: `${img.angle} - Before & After`,
      tags: [img.angle.toLowerCase().replace(/\s+/g, '-'), 'composite'],
    }));

    const { error: imagesError } = await supabase
      .from('images')
      .insert(images);

    if (imagesError) {
      console.error('Error creating images:', imagesError);
      // Delete the case since image creation failed
      await supabase
        .from('cases')
        .delete()
        .eq('id', newCase.id);

      return NextResponse.json(
        { error: 'Failed to create images' },
        { status: 500 }
      );
    }

    return NextResponse.json(newCase);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json(
        { error: 'Album ID is required' },
        { status: 400 }
      );
    }

    // Get cases with their images
    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        *,
        images (
          id,
          cloudinary_url,
          caption,
          tags
        )
      `)
      .eq('album_id', albumId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Format cases with their images
    const formattedCases = cases?.map((case_: Case) => {
      const imagesByAngle = case_.images.reduce((acc: Record<string, string>, img: GalleryImage) => {
        const angle = img.tags.find(tag => tag !== 'composite');
        if (angle) {
          acc[angle] = img.cloudinary_url;
        }
        return acc;
      }, {});

      return {
        ...case_,
        imagesByAngle,
      };
    });

    return NextResponse.json(formattedCases);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 