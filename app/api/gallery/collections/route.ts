import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for creating new collection
const collectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = collectionSchema.parse(body);

    // Check if a collection with this slug already exists
    const { data: existingCollection, error: checkError } = await supabase
      .from('galleries')
      .select('id')
      .eq('title', validatedData.title)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing collection:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing collection' },
        { status: 500 }
      );
    }

    if (existingCollection) {
      return NextResponse.json(
        { error: 'A collection with this title already exists' },
        { status: 409 }
      );
    }

    // Create the collection in Supabase
    const { data, error } = await supabase
      .from('galleries')
      .insert({
        title: validatedData.title,
        description: validatedData.description || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      return NextResponse.json(
        { error: 'Failed to create collection' },
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