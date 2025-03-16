import { NextResponse } from 'next/server';
import zenotiClient from '@/lib/zenoti-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeCredentials = searchParams.get('includeCredentials') === 'true';
  
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development' && includeCredentials) {
    return NextResponse.json({
      error: 'Including credentials is only allowed in development mode'
    }, { status: 403 });
  }
  
  try {
    // Basic connection test
    const credentialInfo = {
      ZENOTI_API_URL: process.env.ZENOTI_API_URL,
      ZENOTI_API_KEY: includeCredentials ? process.env.ZENOTI_API_KEY : `${process.env.ZENOTI_API_KEY?.substring(0, 4)}...${process.env.ZENOTI_API_KEY?.slice(-4)}`,
      ZENOTI_API_SECRET: includeCredentials ? process.env.ZENOTI_API_SECRET : `${process.env.ZENOTI_API_SECRET?.substring(0, 4)}...${process.env.ZENOTI_API_SECRET?.slice(-4)}`,
      ZENOTI_APPLICATION_ID: process.env.ZENOTI_APP_ID,
    };
    
    // Test connection
    try {
      // Attempt to connect to Zenoti
      const response = await zenotiClient.get('/v1/catalog/services');
      
      return NextResponse.json({
        status: 'success',
        message: 'Successfully connected to Zenoti API',
        credentials: credentialInfo,
        response_status: response.status,
        services_count: response.data.services?.length || 0,
      });
    } catch (connectionError: any) {
      // Connection failed
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Zenoti API',
        error: connectionError.message,
        response_status: connectionError.response?.status,
        response_data: connectionError.response?.data,
        credentials: credentialInfo,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Zenoti Credentials Check Error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error checking Zenoti credentials',
      error: error.message,
    }, { status: 500 });
  }
} 