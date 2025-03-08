import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/zenoti';

export async function GET() {
  try {
    console.log('Testing Zenoti API connection...');
    
    // Check environment variables
    const envStatus = {
      ZENOTI_API_URL: process.env.ZENOTI_API_URL ? '✓ Set' : '✗ Missing',
      ZENOTI_API_KEY: process.env.ZENOTI_API_KEY ? '✓ Set' : '✗ Missing',
      ZENOTI_API_SECRET: process.env.ZENOTI_API_SECRET ? '✓ Set' : '✗ Missing',
      ZENOTI_APPLICATION_ID: process.env.ZENOTI_APPLICATION_ID ? '✓ Set' : '✗ Missing',
    };
    
    // Test the connection
    const connectionResult = await testConnection();
    
    return NextResponse.json({
      success: connectionResult.success,
      message: connectionResult.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        variables: envStatus
      },
      data: {
        serviceCount: connectionResult.serviceCount,
        providerCount: connectionResult.providerCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error testing Zenoti connection:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while testing the Zenoti API connection',
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          zenotiDetails: error.zenotiDetails
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          variables: {
            ZENOTI_API_URL: process.env.ZENOTI_API_URL ? '✓ Set' : '✗ Missing',
            ZENOTI_API_KEY: process.env.ZENOTI_API_KEY ? '✓ Set' : '✗ Missing',
            ZENOTI_API_SECRET: process.env.ZENOTI_API_SECRET ? '✓ Set' : '✗ Missing',
            ZENOTI_APPLICATION_ID: process.env.ZENOTI_APPLICATION_ID ? '✓ Set' : '✗ Missing',
          }
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 