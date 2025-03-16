import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bulkActionSchema = z.object({
  action: z.enum(['publish', 'archive', 'delete']),
  ids: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ids } = bulkActionSchema.parse(body);

    switch (action) {
      case 'publish':
        const { error: publishError } = await supabase
          .from('articles')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .in('id', ids);

        if (publishError) throw publishError;
        break;

      case 'archive':
        const { error: archiveError } = await supabase
          .from('articles')
          .update({ status: 'archived' })
          .in('id', ids);

        if (archiveError) throw archiveError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .in('id', ids);

        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error('Invalid action');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    );
  }
} 