import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Revalidation API Route
 * 
 * This API route allows for on-demand revalidation of specific paths.
 * It's used to clear the cache for pages that display media assets
 * when those assets are updated.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the path from the query parameters
    const path = await request.nextUrl.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Path parameter is required' },
        { status: 400 }
      );
    }
    
    // Revalidate the path
    revalidatePath(path);
    
    return NextResponse.json({
      success: true,
      revalidated: true,
      message: `Path ${path} revalidated`
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    
    return NextResponse.json(
      { success: false, message: 'Error revalidating path' },
      { status: 500 }
    );
  }
} 