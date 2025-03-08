import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/zenoti';

export async function GET() {
  try {
    console.log('Checking Zenoti API status...');
    
    // Test the connection
    const connectionResult = await testConnection();
    
    return NextResponse.json({
      success: connectionResult.success,
      message: connectionResult.message,
      serviceCount: connectionResult.serviceCount,
      providerCount: connectionResult.providerCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error checking Zenoti status:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while checking the Zenoti API status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}