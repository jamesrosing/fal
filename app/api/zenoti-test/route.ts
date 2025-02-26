import { NextResponse } from 'next/server';
import zenotiClient from '@/lib/zenoti-server';

export async function GET(request: Request) {
  try {
    // Basic connection test
    const response = await zenotiClient.get('/v1/catalog/services');
    
    return NextResponse.json({
      success: true,
      message: 'Zenoti API connection successful',
      services_count: response.data.services?.length || 0,
      first_few_services: response.data.services?.slice(0, 3) || []
    });
  } catch (error: any) {
    console.error('Zenoti API Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Zenoti API',
      details: error.response?.data || error.message,
      status: error.response?.status
    }, {
      status: error.response?.status || 500
    });
  }
} 