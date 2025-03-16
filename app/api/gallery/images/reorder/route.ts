import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for reordering images
const reorderSchema = z.object({
  case_id: z.string().uuid(),
  image_orders: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().positive()
    })
  ),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const validatedData = reorderSchema.parse(body);
    
    // Verify all images belong to the specified case
    const { data: caseImages, error: imagesError } = await supabase
      .from('images')
      .select('id')
      .eq('case_id', validatedData.case_id);
    
    if (imagesError) {
      console.error('Error fetching case images:', imagesError);
      return NextResponse.json(
        { error: 'Failed to fetch case images' },
        { status: 500 }
      );
    }
    
    const caseImageIds = new Set(caseImages.map(img => img.id));
    const allImagesExist = validatedData.image_orders.every(img => caseImageIds.has(img.id));
    
    if (!allImagesExist) {
      return NextResponse.json(
        { error: 'One or more images do not belong to this case' },
        { status: 400 }
      );
    }
    
    // Update the display_order for each image in a transaction
    const { error: updateError } = await supabase.rpc('update_image_orders', {
      image_orders: validatedData.image_orders
    });
    
    if (updateError) {
      console.error('Error updating image orders:', updateError);
      
      // Fallback method if the RPC method fails
      for (const img of validatedData.image_orders) {
        const { error: singleUpdateError } = await supabase
          .from('images')
          .update({ display_order: img.display_order })
          .eq('id', img.id)
          .eq('case_id', validatedData.case_id);
        
        if (singleUpdateError) {
          console.error(`Error updating order for image ${img.id}:`, singleUpdateError);
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Image orders updated successfully' 
    });
  } catch (error) {
    console.error('Error processing reorder request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 