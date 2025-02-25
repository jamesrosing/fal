import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Validation schema for creating new album
const albumSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  gallery_id: z.string().uuid(),
  slug: z.string().min(1, 'Slug is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = albumSchema.parse(body);

    // Check if an album with this slug already exists in this gallery
    const { data: existingAlbum, error: checkError } = await supabase
      .from('albums')
      .select('id')
      .eq('gallery_id', validatedData.gallery_id)
      .eq('title', validatedData.title)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing album:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing album' },
        { status: 500 }
      );
    }

    if (existingAlbum) {
      return NextResponse.json(
        { error: 'An album with this title already exists in this gallery' },
        { status: 409 }
      );
    }

    // Create the album in Supabase
    const { data, error } = await supabase
      .from('albums')
      .insert({
        title: validatedData.title,
        description: validatedData.description || '',
        gallery_id: validatedData.gallery_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating album:', error);
      return NextResponse.json(
        { error: 'Failed to create album' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 