import { NextResponse } from 'next/server';

// Make the route work with Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Simple test endpoint to verify API functionality
 */
export async function GET() {
  try {
    console.log('Test API endpoint called');
    
    // Return a simple test response
    return NextResponse.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 