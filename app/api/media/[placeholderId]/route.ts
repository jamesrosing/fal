import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { placeholderId: string } }
) {
  const placeholderId = params.placeholderId;
  
  if (!placeholderId) {
    return NextResponse.json(
      { error: 'Missing placeholderId parameter' },
      { status: 400 }
    );
  }
  
  try {
    const supabase = createClient();
    
    // Delete the media asset from the media_assets table
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('placeholder_id', placeholderId);
    
    if (error) {
      console.error('Error deleting media asset:', error);
      return NextResponse.json(
        { error: `Failed to delete media asset: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete media asset' },
      { status: 500 }
    );
  }
} 