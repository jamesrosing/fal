import { NextResponse } from 'next/server';
import { clearZenotiCache } from '@/lib/cache';

export async function POST() {
  try {
    console.log('Clearing Zenoti cache...');
    
    // Clear the cache
    const clearedCount = clearZenotiCache();
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${clearedCount} Zenoti cache entries`,
      clearedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error clearing Zenoti cache:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while clearing the Zenoti cache',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 