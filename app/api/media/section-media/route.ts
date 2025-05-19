import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// GET - Fetch all section media or filter by page and section
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const page_path = searchParams.get('page_path');
    const section_name = searchParams.get('section_name');
    
    let query = supabase
      .from('section_media')
      .select(`
        *,
        media_asset:media_assets(
          id,
          cloudinary_id,
          type,
          title,
          alt_text,
          width,
          height,
          format,
          url
        )
      `)
      .order('display_order', { ascending: true });
    
    if (page_path) {
      query = query.eq('page_path', page_path);
    }
    
    if (section_name) {
      query = query.eq('section_name', section_name);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching section media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ sectionMedia: data });
  } catch (error: any) {
    console.error('Error processing section media request:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST - Create a new section media entry
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { page_path, section_name, media_asset_id, display_order = 0, metadata = {} } = await request.json();
    
    // Validate required fields
    if (!page_path || !section_name || !media_asset_id) {
      return NextResponse.json(
        { error: 'page_path, section_name, and media_asset_id are required' },
        { status: 400 }
      );
    }
    
    // Insert new section media entry
    const { data, error } = await supabase
      .from('section_media')
      .insert({
        page_path,
        section_name,
        media_asset_id,
        display_order,
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating section media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Revalidate the paths
    revalidatePath(`/admin/media`);
    revalidatePath(`/${page_path}`);
    
    return NextResponse.json({ sectionMedia: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing section media creation:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// PUT - Update a section media entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { id, media_asset_id, display_order, metadata } = await request.json();
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }
    
    // Prepare update object
    const updateObject: any = {};
    if (media_asset_id !== undefined) updateObject.media_asset_id = media_asset_id;
    if (display_order !== undefined) updateObject.display_order = display_order;
    if (metadata !== undefined) updateObject.metadata = metadata;
    
    // Update section media entry
    const { data, error } = await supabase
      .from('section_media')
      .update(updateObject)
      .eq('id', id)
      .select(`*, media_asset:media_assets(*)`)
      .single();
    
    if (error) {
      console.error('Error updating section media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Revalidate relevant paths
    revalidatePath(`/admin/media`);
    if (data.page_path) {
      revalidatePath(`/${data.page_path}`);
    }
    
    return NextResponse.json({ sectionMedia: data });
  } catch (error: any) {
    console.error('Error processing section media update:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a section media entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }
    
    // Get the section media entry first to get page path for revalidation
    const { data: sectionMedia } = await supabase
      .from('section_media')
      .select('page_path')
      .eq('id', id)
      .single();
    
    // Delete the section media entry
    const { error } = await supabase
      .from('section_media')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting section media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Revalidate paths
    revalidatePath(`/admin/media`);
    if (sectionMedia?.page_path) {
      revalidatePath(`/${sectionMedia.page_path}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing section media deletion:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 