import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Your Google OAuth credentials (store these in environment variables)
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_OAUTH_REDIRECT_URI_PRODUCTION 
  : process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback';

// Your Business Profile information
const ACCOUNT_ID = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
const LOCATION_ID = process.env.GOOGLE_BUSINESS_LOCATION_ID;

// Create OAuth client
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET() {
  try {
    const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // Log partial API key for debugging (don't log the full key for security)
    const partialKey = mapsApiKey ? 
      `${mapsApiKey.substring(0, 6)}...${mapsApiKey.substring(mapsApiKey.length - 4)}` : 
      'Not set';
    console.log("Using Google Maps API key:", partialKey);
    
    // In a real application, you would store and manage tokens securely
    // For now, we're assuming you've already obtained a token through the OAuth flow
    // and stored it securely (e.g., in a database, environment variable, etc.)
    
    // Check if we have a valid token - this would typically be fetched from your secure storage
    const token = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
    
    if (!token) {
      // Return error or authorization URL
      console.log("No access token found, generating auth URL");
      return NextResponse.json({ 
        error: 'Authentication required', 
        authUrl: oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/business.manage'],
          prompt: 'consent', // Force re-consent to get refresh token
        })
      }, { status: 401 });
    }
    
    // Set credentials
    oAuth2Client.setCredentials({ access_token: token });
    
    // Create API client - FIXED: Use the proper method to create the My Business API client
    const mybusinessaccounts = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oAuth2Client
    });
    
    const mybusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1', 
      auth: oAuth2Client
    });
    
    // Fetch location data
    // Note: You need to have the account ID and location ID for your business
    if (!ACCOUNT_ID || !LOCATION_ID) {
      console.error("Missing account or location ID");
      return NextResponse.json({ 
        error: 'Business profile configuration missing', 
        details: 'Account ID and Location ID are required'
      }, { status: 500 });
    }
    
    console.log(`Fetching business data for account: ${ACCOUNT_ID}, location: ${LOCATION_ID}`);
    
    try {
      // Get location using the business information API
      const response = await mybusinessinformation.locations.get({
        name: `locations/${LOCATION_ID}`,
      });
      
      console.log("Business profile data retrieved successfully");
      
      // Format the data for the frontend
      const businessData = {
        name: response.data.title || response.data.storefrontAddress,
        address: {
          formattedAddress: response.data.storefrontAddress?.addressLines?.join(', '),
          locality: response.data.storefrontAddress?.locality,
          region: response.data.storefrontAddress?.administrativeArea,
          postalCode: response.data.storefrontAddress?.postalCode,
        },
        // Handle phone numbers safely by checking what properties are available
        phoneNumber: getPhoneNumber(response.data.phoneNumbers),
        websiteUrl: response.data.websiteUri,
        regularHours: formatBusinessHours(response.data.regularHours),
        specialHours: response.data.specialHours,
        latitude: response.data.latlng?.latitude,
        longitude: response.data.latlng?.longitude,
        // You would fetch these separately with additional API calls
        rating: null,
        reviewCount: null,
      };
      
      return NextResponse.json(businessData);
    } catch (apiError: any) {
      console.error("API error fetching location:", apiError);
      
      // If we get a specific error about the location not being found, try listing locations
      if (apiError.code === 404 || apiError.message?.includes('not found')) {
        try {
          console.log("Location not found, listing available locations");
          const accountsResponse = await mybusinessaccounts.accounts.list();
          
          return NextResponse.json({ 
            error: 'Location not found',
            availableAccounts: accountsResponse.data.accounts,
            message: 'Please check your account and location IDs'
          }, { status: 404 });
        } catch (listError: any) {
          console.error("Error listing accounts:", listError);
          return NextResponse.json({ 
            error: 'API error', 
            details: listError.message 
          }, { status: 500 });
        }
      }
      
      throw apiError; // Re-throw for the main catch block
    }
  } catch (error: any) {
    console.error('Error fetching business profile:', error);
    
    // Handle token expiration
    if (error.status === 401 || (error.response?.status === 401)) {
      console.log("Authentication token expired or invalid");
      return NextResponse.json({ 
        error: 'Authentication token expired', 
        authUrl: oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/business.manage'],
          prompt: 'consent', // Force re-consent to get refresh token
        })
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch business profile', 
      details: error.message 
    }, { status: 500 });
  }
}

// Helper function to format business hours
function formatBusinessHours(hours: any) {
  if (!hours || !hours.periods) return null;
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    periods: hours.periods.map((period: any) => {
      const openDay = dayNames[period.openDay - 1] || `Day ${period.openDay}`;
      const closeDay = dayNames[period.closeDay - 1] || `Day ${period.closeDay}`;
      
      return {
        openDay,
        closeDay,
        openTime: formatTime(period.openTime),
        closeTime: formatTime(period.closeTime),
      };
    })
  };
}

// Helper function to format time (HH:MM)
function formatTime(time: any) {
  if (!time) return 'N/A';
  
  const hours = time.hours.toString().padStart(2, '0');
  const minutes = time.minutes.toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// Helper function to safely extract phone number
function getPhoneNumber(phoneNumbers: any) {
  if (!phoneNumbers) return null;
  
  // Log available properties to help debug
  console.log("Available phone number properties:", Object.keys(phoneNumbers));
  
  // Try different potential property names
  for (const key of Object.keys(phoneNumbers)) {
    if (typeof phoneNumbers[key] === 'string' && phoneNumbers[key].length > 0) {
      return phoneNumbers[key];
    }
  }
  
  return null;
} 