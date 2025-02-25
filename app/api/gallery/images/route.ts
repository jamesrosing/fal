import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Validation schema for creating new image
const imageSchema = z.object({
  case_id: z.string().uuid(),
  cloudinary_url: z.string().url(),
  caption: z.string(),
  tags: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = imageSchema.parse(body);

    // Create the image in Supabase
    const { data, error } = await supabase
      .from('images')
      .insert({
        case_id: validatedData.case_id,
        cloudinary_url: validatedData.cloudinary_url,
        caption: validatedData.caption,
        tags: validatedData.tags,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating image:', error);
      return NextResponse.json(
        { error: 'Failed to create image' },
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