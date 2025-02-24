import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const reorderSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    order_position: z.number(),
  })),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categories } = reorderSchema.parse(body);

    // Update each category's order in a transaction
    const { error } = await supabase.rpc('reorder_categories', {
      category_orders: categories.map(cat => ({
        id: cat.id,
        order_position: cat.order_position,
      })),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    );
  }
} 